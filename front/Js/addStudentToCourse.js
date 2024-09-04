document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');
    const studentId = localStorage.getItem('studentId');

    if (!teacherId || !studentId) {
        showNotification('Teacher ID or Student ID not found in local storage.', 'error');
        return;
    }

    // Load the courses for the teacher
    try {
        const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const courseList = document.getElementById('courseList');
            courses.forEach(course => {
                const courseCheckbox = document.createElement('div');
                courseCheckbox.className = 'form-check';
                courseCheckbox.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${course.id}" id="course${course.id}">
                    <label class="form-check-label" for="course${course.id}">
                        ${course.courseName}
                    </label>
                `;
                courseList.appendChild(courseCheckbox);
            });
        } else {
            showNotification('Failed to load courses: ' + courses.message, 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses: ' + error.message, 'error');
    }

    // Handle form submission
    document.getElementById('courseAssignmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const selectedCourses = [];
        document.querySelectorAll('#courseList input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCourses.push(checkbox.value);
        });

        if (selectedCourses.length === 0) {
            showNotification('Please select at least one course.', 'error');
            return;
        }

        try {
            for (const courseId of selectedCourses) {
                await fetch('http://localhost:3000/api/enrollment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId,
                        courseId,
                        enrollmentDate: new Date().toISOString().split('T')[0],  // Use the current date
                        finalGrade: 0.0, 
                    })
                });
            }

            showNotification('Student successfully enrolled in courses!', 'success');
            setTimeout(() => {
                window.location.href = 'students.html'; // Redirect back to the student management page
            }, 2000);
        } catch (error) {
            console.error('Error assigning student to courses:', error);
            showNotification('Error assigning student to courses: ' + error.message, 'error');
        }
    });
});

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
