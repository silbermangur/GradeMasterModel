document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        showNotification('Teacher ID not found in local storage.', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const classSelect = document.getElementById('classSelect');
            let firstCourseId = null;

            courses.forEach((course, index) => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.courseName;
                classSelect.appendChild(option);

                if (index === 0) {
                    firstCourseId = course.id; // Store the ID of the first course
                }
            });

            // Automatically load students for the first course
            if (firstCourseId) {
                await loadStudents(firstCourseId);
            }

            // Load students when a course is selected
            classSelect.addEventListener('change', async function() {
                const courseId = this.value;
                await loadStudents(courseId);
            });

        } else {
            showNotification('Failed to load courses: ' + courses.message, 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses: ' + error.message, 'error');
    }

    // Add event listener for "Add New Student" button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function() {
            window.location.href = 'addStudent.html';
        });
    }
});

// Function to load students for a specific course
async function loadStudents(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enrolled-students`);
        const students = await response.json();

        if (response.ok) {
            const studentsList = document.querySelector('#studentsList tbody');
            studentsList.innerHTML = ''; // Clear existing students

            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.studentId}</td>
                    <td>
                        <button class="btn btn-sm btn-warning">ערוך</button>
                        <button class="btn btn-sm btn-danger" data-student-id="${student.id}" data-course-id="${courseId}">מחק</button>
                    </td>
                `;
                studentsList.appendChild(row);
            });

            // Attach event listeners to delete buttons
            const deleteButtons = document.querySelectorAll('.btn-danger');
            deleteButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const studentId = this.getAttribute('data-student-id');
                    const courseId = this.getAttribute('data-course-id');
                    await removeStudentFromCourse(courseId, studentId);
                });
            });

        } else {
            showNotification('Failed to load students: ' + students.message, 'error');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Error loading students: ' + error.message, 'error');
    }
}

// Function to check if attendance exists for a specific course
async function checkAttendance(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/attendance-check-exists`);
        const attendanceData = await response.json();

        const addStudentBtn = document.getElementById('addStudentBtn');
        if (attendanceData.exists) {
            showNotification('Cannot add new students because attendance has already been created for this course.', 'error');
            addStudentBtn.disabled = true; // Disable the add student button
        } else {
            addStudentBtn.disabled = false; // Enable the add student button
        }
    } catch (error) {
        console.error('Error checking attendance:', error);
        showNotification('Error checking attendance: ' + error.message, 'error');
    }
}

// Function to remove a student from a course
async function removeStudentFromCourse(courseId, studentId) {
    if (confirm('Are you sure you want to remove this student from the course?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/students/${studentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Student removed from course successfully', 'success');
                // Reload the students list
                await loadStudents(courseId);
            } else {
                showNotification('Failed to remove student: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            showNotification('Error removing student: ' + error.message, 'error');
        }
    }
}

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
