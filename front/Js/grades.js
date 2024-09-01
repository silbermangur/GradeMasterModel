document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        showNotification('Teacher ID not found in local storage.', 'error');
        return;
    }

    // Load the courses for the teacher
    try {
        const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const classSelect = document.getElementById('classSelect');
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.courseName;
                classSelect.appendChild(option);
            });

            // Automatically load assignments/exams for the first course
            if (courses.length > 0) {
                await loadAssignmentsAndExams(courses[0].id);
            }

            // Load assignments/exams when a course is selected
            classSelect.addEventListener('change', async function() {
                const courseId = this.value;
                await loadAssignmentsAndExams(courseId);
            });
        } else {
            showNotification('Failed to load courses: ' + courses.message, 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses: ' + error.message, 'error');
    }
});

// Function to load assignments and exams for a specific course
async function loadAssignmentsAndExams(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/assignments-exams`);
        const assignmentsExams = await response.json();

        if (response.ok) {
            const assignmentSelect = document.getElementById('assignmentSelect');
            assignmentSelect.innerHTML = ''; // Clear previous options

            assignmentsExams.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.type === 'assignment' ? item.assignmentName : item.examName;

                option.dataset.type = item.type; // "assignment" or "exam"
                assignmentSelect.appendChild(option);
            });

            // Automatically load grades for the first assignment/exam
            if (assignmentsExams.length > 0) {
                await loadGrades(courseId, assignmentsExams[0].id, assignmentsExams[0].type);
            }

            // Load grades when an assignment/exam is selected
            assignmentSelect.addEventListener('change', async function() {
                const assignmentExamId = this.value;
                const type = this.selectedOptions[0].dataset.type;
                await loadGrades(courseId, assignmentExamId, type);
            });
        } else {
            showNotification('Failed to load assignments/exams: ' + assignmentsExams.message, 'error');
        }
    } catch (error) {
        console.error('Error loading assignments/exams:', error);
        showNotification('Error loading assignments/exams: ' + error.message, 'error');
    }
}

// Function to load grades and final scores for a specific assignment/exam
async function loadGrades(courseId, assignmentExamId, type) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/grades?assignmentExamId=${assignmentExamId}&type=${type}`);
        const gradesData = await response.json();

        if (response.ok) {
            const gradesTableContainer = document.getElementById('gradesTableContainer');
            gradesTableContainer.innerHTML = ''; // Clear previous table

            // Create grades table
            const table = document.createElement('table');
            table.className = 'table table-bordered';

            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<th>Student Name</th><th>${type === 'assignment' ? 'Assignment Grade' : 'Exam Grade'}</th><th>Final Score</th>`;
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            for (const student of gradesData.students) {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${student.firstName} ${student.lastName}</td>`;

                // Grade display with change button
                const gradeCell = document.createElement('td');
                if (student.grade !== null) {
                    const gradeSpan = document.createElement('h1');
                    gradeSpan.className = 'text-danger';
                    gradeSpan.textContent = student.grade;
                    gradeCell.appendChild(gradeSpan);

                    const button = document.createElement('button');
                    button.textContent = 'Change Grade';
                    button.className = 'btn btn-primary btn-sm ml-2';
                    button.addEventListener('click', function() {
                        const gradeType = type === 'assignment' ? 'assignment' : 'exam';
                        localStorage.setItem('gradeType', gradeType);
                        localStorage.setItem('gradeId', assignmentExamId);
                        localStorage.setItem('studentId', student.id);
                        window.location.href = 'enterGrade.html';
                    });
                    gradeCell.appendChild(button);
                } else {
                    const button = document.createElement('button');
                    button.textContent = 'Change Grade';
                    button.className = 'btn btn-primary btn-sm';
                    button.addEventListener('click', function() {
                        const gradeType = type === 'assignment' ? 'assignment' : 'exam';
                        localStorage.setItem('gradeType', gradeType);
                        localStorage.setItem('gradeId', assignmentExamId);
                        localStorage.setItem('studentId', student.id);
                        window.location.href = 'enterGrade.html';
                    });
                    gradeCell.appendChild(button);
                }
                row.appendChild(gradeCell);

                // Fetch and display the final grade
                const finalGradeCell = document.createElement('td');
                finalGradeCell.className = 'final-grade-cell';
                finalGradeCell.dataset.studentId = student.id; // Store studentId for later use

                // Fetch final grade for the student
                try {
                    const finalGradeResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/students/${student.id}/final-grade`);
                    const finalGradeData = await finalGradeResponse.json();

                    if (finalGradeResponse.ok) {
                        const finalGrade = parseFloat(finalGradeData.finalGrade);
                        finalGradeCell.textContent = isNaN(finalGrade) ? '0.00' : finalGrade.toFixed(2);
                    } else {
                        finalGradeCell.textContent = '0.00';
                    }
                } catch (error) {
                    finalGradeCell.textContent = '0.00';
                    console.error(`Error fetching final grade for student ID ${student.id}:`, error);
                }

                row.appendChild(finalGradeCell);
                tbody.appendChild(row);
            }
            table.appendChild(tbody);

            gradesTableContainer.appendChild(table);

            // Enable the "Calculate Final Grade" button
            document.getElementById('calcFinalGradeBtn').disabled = false;

        } else {
            showNotification('Failed to load grades: ' + gradesData.message, 'error');
        }
    } catch (error) {
        console.error('Error loading grades:', error);
        showNotification('Error loading grades: ' + error.message, 'error');
    }
}

// Handle "Calculate Final Grade" button click
document.getElementById('calcFinalGradeBtn').addEventListener('click', async function() {
    const courseId = document.getElementById('classSelect').value;
    const finalGradeCells = document.querySelectorAll('.final-grade-cell');

    try {
        // Check if attendance exists for the course
        const attendanceResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/attendance-check`);
        const attendanceData = await attendanceResponse.json();

        if (!attendanceResponse.ok || !attendanceData.exists) {
            showNotification('Cannot calculate final grade because you have not created at least one attendance lesson for the class.', 'error');
            return;
        }

        // Iterate over each student and calculate their final grade
        for (const finalGradeCell of finalGradeCells) {
            const studentId = finalGradeCell.dataset.studentId;

            // Fetch final grade for the student
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/students/${studentId}/final-grade`);
            const finalGradeData = await response.json();

            if (response.ok) {
                const finalGrade = parseFloat(finalGradeData.finalGrade);
                finalGradeCell.textContent = isNaN(finalGrade) ? 'N/A' : finalGrade.toFixed(2);
            } else {
                showNotification(`Failed to calculate final grade for student ID ${studentId}: ` + finalGradeData.message, 'error');
            }
        }

        showNotification('Final grades calculated successfully!', 'success');
    } catch (error) {
        console.error('Error calculating final grades:', error);
        showNotification('Error calculating final grades: ' + error.message, 'error');
    }
});

// Function to show a custom notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    // Show the notification
    notification.style.display = 'block';

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.className = `notification ${type}`;
        setTimeout(() => notification.style.display = 'none', 300);
    }, 3000);
}
