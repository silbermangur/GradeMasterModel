document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');

    if (!studentId) {
        alert('Student ID not found.');
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
            alert('Failed to load student data: ' + student.message);
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        alert('Error loading student data: ' + error.message);
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
                alert('Student updated successfully!');
                window.location.href = 'students.html'; // Redirect back to the student management page
            } else {
                alert('Failed to update student: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Error updating student: ' + error.message);
        }
    });
});
