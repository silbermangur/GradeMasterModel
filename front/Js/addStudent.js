document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const studentData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            enrollmentDate: document.getElementById('enrollmentDate').value,
        };

        // Send the student data to the backend
        try {
            const response = await fetch('http://localhost:3000/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('studentId', result.id);
                showNotification('Student added successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'addStudentToCourse.html'; // Redirect back to the student management page
                }, 2000);
            } else {
                showNotification('Failed to add student: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            showNotification('Error adding student: ' + error.message, 'error');
        }
    });
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
