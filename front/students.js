document.addEventListener('DOMContentLoaded', async function() {
    // Get the teacherId from localStorage
    const teacherId = localStorage.getItem('teacherId');

    // Handle "Add New Student" button click
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function() {
            window.location.href = 'addStudent.html';
        });
    }

    if (!teacherId) {
        alert('Teacher ID not found in local storage.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/teacher/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const classSelect = document.getElementById('classSelect');
            let firstCourseId = null;

            courses.forEach((course ,index) => {
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
            alert('Failed to load courses: ' + courses.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Error loading courses: ' + error.message);
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
                        <button class="btn btn-sm btn-danger">מחק</button>
                    </td>
                `;
                studentsList.appendChild(row);
            });
        } else {
            alert('Failed to load students: ' + students.message);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        alert('Error loading students: ' + error.message);
    }
}