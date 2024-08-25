/*
document.getElementById('addStudentBtn').addEventListener('click', function() {
    const studentEntry = document.createElement('div');
    studentEntry.className = 'student-entry mb-3';
    studentEntry.innerHTML = `
        <input type="text" class="form-control mb-2" placeholder="שם פרטי">
        <input type="text" class="form-control mb-2" placeholder="שם משפחה">
        <input type="text" class="form-control mb-2" placeholder="תעודת זהות">
    `;
    document.getElementById('studentsList').appendChild(studentEntry);
});
*/

document.getElementById("classform").addEventListener('submit', async(e)=> {
    e.preventDefault();

    // get course data
    const className = document.getElementById("className").value;
    const classCode = document.getElementById("classCode").value;
    const classCredit = document.getElementById("classCredit").value;
    const attendanceWeight = parseFloat(document.getElementById("attendanceWeight").value);

    //const course = { className, classCode, classCredit, attendanceWeight}

    // Retrieve the teacherId from local storage
    const teacherId = localStorage.getItem('teacherId');
    
    if (!teacherId) {
        alert('Teacher ID not found. Please log in again.');
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

            // Store the teacherId in local storage
            localStorage.setItem('courseId', result.course.id);

            // You can redirect the user to the dashboard or another page after login
            window.location.href = 'examAssignment.html';
            alert('Course, exam, and assignments created successfully!');
        } else {
            alert(result.message || 'Failed to create course.');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
})