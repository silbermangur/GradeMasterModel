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
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.courseName;
                classSelect.appendChild(option);
            });
        } else {
            alert('Failed to load courses: ' + courses.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Error loading courses: ' + error.message);
    }
});
