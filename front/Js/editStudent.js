document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');

    if (!studentId) {
        showNotification('Student ID not found.', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/students/${studentId}`);
        const student = await response.json();

        if (response.ok) {
            document.getElementById('firstName').value = student.firstName;
            document.getElementById('lastName').value = student.lastName;
            document.getElementById('dateOfBirth').value = student.dateOfBirth;
            document.getElementById('gender').value = student.gender;
            document.getElementById('phoneNumber').value = student.phoneNumber;
            document.getElementById('address').value = student.address;
            document.getElementById('email').value = student.email;
        } else {
            showNotification('Failed to load student data: ' + student.message, 'error');
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        showNotification('Error loading student data: ' + error.message, 'error');
    }

    document.getElementById('editStudentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const updatedStudentData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
        };

        try {
            const response = await fetch(`http://localhost:3000/api/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedStudentData)
            });

            const result = await response.json();
            if (response.ok) {
                showNotification('Student updated successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'students.html'; // Redirect back to the student management page
                }, 2000);
            } else {
                showNotification('Failed to update student: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            showNotification('Error updating student: ' + error.message, 'error');
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
