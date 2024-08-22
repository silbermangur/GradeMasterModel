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
            alert('Teacher registered successfully!');
            window.location.href = 'login.html'; // Redirect to login page after success
        } else {
            const errorData = await response.json();
            alert('Failed to register teacher: ' + errorData.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
