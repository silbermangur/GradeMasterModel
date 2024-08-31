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


document.getElementById('loginform').addEventListener('submit',  async (e) => {
    e.preventDefault();

     // Get form data
     const email = document.getElementById("email").value;
     const password = document.getElementById("password").value;

     // Create data Object
     const data = {
        email,
        password
    }

    try {

        // Send a POST request to the login endpoint
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                localStorage.setItem('teacherId', result.teacher.id);
                window.location.href = 'Home.html';
            }, 2000); // Redirect after showing notification

        } else {
            showNotification(result.message, 'error');

        }
    } catch (error) {
        showNotification(error.message, 'error');
    }

});