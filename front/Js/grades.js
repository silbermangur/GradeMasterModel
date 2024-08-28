document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        alert('Teacher ID not found in local storage.');
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
            alert('Failed to load courses: ' + courses.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Error loading courses: ' + error.message);
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
            alert('Failed to load assignments/exams: ' + assignmentsExams.message);
        }
    } catch (error) {
        console.error('Error loading assignments/exams:', error);
        alert('Error loading assignments/exams: ' + error.message);
    }
}

// Function to load grades for a specific assignment/exam
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
            headerRow.innerHTML = `<th>שם הסטודנט</th><th>${type === 'assignment' ? 'ציון משימה' : 'ציון מבחן'}</th><th>ציון סופי</th>`;
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            gradesData.students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${student.firstName} ${student.lastName}</td>`;
                
                // Grade display with change button
                const gradeCell = document.createElement('td');
                if (student.grade !== null) {
                    const gradeSpan = document.createElement('h1');
                    gradeSpan.className = 'text-danger'
                    gradeSpan.textContent = student.grade;
                    gradeCell.appendChild(gradeSpan);

                    const button = document.createElement('button');
                    button.textContent = 'שנה ציון';
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
                    button.textContent = 'שנה ציון';
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

                // Add final grade button and display area
                const finalGradeCell = document.createElement('td');
                const finalGradeDisplay = document.createElement('h1');
                const finalGradeButton = document.createElement('button');

                finalGradeButton.textContent = 'חשב ציון סופי';
                finalGradeButton.className = 'btn btn-success btn-sm';
                finalGradeDisplay.className = 'text-info';
                
                finalGradeButton.addEventListener('click', async function() {
                    const finalGrade = await calculateFinalGrade(student.id, courseId);
                    if (finalGrade) {
                        finalGradeDisplay.textContent = `${finalGrade}`;
                        alert(`Final Grade for ${student.firstName} ${student.lastName}: ${finalGrade}`);
                    }
                });
                
                finalGradeCell.appendChild(finalGradeButton);
                finalGradeCell.appendChild(finalGradeDisplay);
                row.appendChild(finalGradeCell);

                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            gradesTableContainer.appendChild(table);
        } else {
            alert('Failed to load grades: ' + gradesData.message);
        }
    } catch (error) {
        console.error('Error loading grades:', error);
        alert('Error loading grades: ' + error.message);
    }
}

// Function to calculate the final grade for a specific student and update it in the database
async function calculateFinalGrade(studentId, courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/students/${studentId}/final-grade`);
        const finalGradeData = await response.json();

        if (response.ok) {
            return finalGradeData.finalGrade;
        } else {
            alert('Failed to calculate final grade: ' + finalGradeData.message);
            return null;
        }
    } catch (error) {
        console.error('Error calculating final grade:', error);
        alert('Error calculating final grade: ' + error.message);
        return null;
    }
}
