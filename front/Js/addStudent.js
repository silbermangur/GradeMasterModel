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
                localStorage.setItem('studentId',result.id)
                alert('Student added successfully!');
                window.location.href = 'addStudentToCourse.html'; // Redirect back to the student management page
            } else {
                alert('Failed to add student: ' + result.message);
            }
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Error adding student: ' + error.message);
        }
    });
});
