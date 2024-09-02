document.addEventListener('DOMContentLoaded', function() {
    // Load classes (courses) and add event listeners for delete buttons
    async function loadClasses() {
        try {
            const response = await fetch('http://localhost:3000/api/courses');
            const courses = await response.json();

            const classesList = document.getElementById('classesList');
            classesList.innerHTML = ''; // Clear existing classes

            courses.forEach(course => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${course.courseName}</td>
                    <td>${course.courseCode}</td>
                    <td>${course.credits}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" data-course-id="${course.id}">Delete</button>
                    </td>
                `;
                classesList.appendChild(row);
            });

            // Attach event listeners to delete buttons
            const deleteButtons = document.querySelectorAll('.btn-danger');
            deleteButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const courseId = this.getAttribute('data-course-id');
                    if (confirm('Are you sure you want to delete this course? This will delete all associated data.')) {
                        await deleteClass(courseId);
                        await loadClasses(); // Reload the classes list after deletion
                    }
                });
            });

        } catch (error) {
            console.error('Error loading classes:', error);
            showNotification('Error loading classes: ' + error.message, 'error');
        }
    }

    // Function to delete a class
    async function deleteClass(courseId) {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (response.ok) {
                showNotification('Course and all associated data deleted successfully', 'success');
            } else {
                showNotification('Failed to delete course: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            showNotification('Error deleting class: ' + error.message, 'error');
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

    // Load classes on page load
    loadClasses();

    document.getElementById("classform").addEventListener('submit', async(e)=> {
        e.preventDefault();
    
        // get course data
        const className = document.getElementById("className").value;
        const classCode = document.getElementById("classCode").value;
        const classCredit = document.getElementById("classCredit").value;
        const attendanceWeight = parseFloat(document.getElementById("attendanceWeight").value);
    
        // Retrieve the teacherId from local storage
        const teacherId = localStorage.getItem('teacherId');
        
        if (!teacherId) {
            showNotification('Teacher ID not found. Please log in again.', 'error');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }
    
        // Create course object with nested exam and assignments
        const courseData = {
            className,
            classCode,
            classCredit,
            attendanceWeight,
            teacherId,
        };
    
        // Send course data to backend
        try {
            const response = await fetch('http://localhost:3000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
    
            const result = await response.json();
            if (response.ok) {
                // Store the courseId in local storage
                localStorage.setItem('courseId', result.course.id);
                showNotification('Course, exam, and assignments created successfully!', 'success');
                window.location.href = 'examAssignment.html';
            } else {
                showNotification(result.message || 'Failed to create course.', 'error');
            }
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        }
    });
});
