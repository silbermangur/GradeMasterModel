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


document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    // Create data object
    const data = {
        firstName,
        lastName,
        email,
        password,
        phoneNumber
    };

    try {
        // Send a POST request to the backend
        const response = await fetch('http://localhost:3000/api/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        

        if (response.ok) {
            showNotification('Teacher registered successfully!', 'success');
            setTimeout(() => window.location.href = 'login.html', 3000); // Redirect after showing notification
        } else {
            const errorData = await response.json();
            showNotification('Failed to register teacher: ' + errorData.message,'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
});
