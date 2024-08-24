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
            alert('Login successful!');

             // Store the teacherId in local storage
             localStorage.setItem('teacherId', result.teacher.id);
             
            // You can redirect the user to the dashboard or another page after login
            window.location.href = 'Home.html';

        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }

});