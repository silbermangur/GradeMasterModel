
// Create the amout of assignment as needed
document.getElementById('generateAssignmentsBtn').addEventListener('click', function() {
    const numAssignments = document.getElementById('numAssignments').value;
    const assignmentsContainer = document.getElementById('assignmentsContainer');


    // Clear any existing assignment fields
    assignmentsContainer.innerHTML = '';

    for (let i = 1; i <= numAssignments; i++) {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.classList.add('form-group');
        assignmentDiv.innerHTML = `
            <h4>Assignment ${i}</h4>
            <label for="assignmentName${i}">Assignment Name</label>
            <input type="text" class="form-control" id="assignmentName${i}" placeholder="Enter assignment name">

            <label for="assignmentDescription${i}">Assignment Description</label>
            <input type="text" class="form-control" id="assignmentDescription${i}" placeholder="Enter assignment description">

            <label for="assignmentDate${i}">Assignment Date</label>
            <input type="datetime-local" class="form-control" id="assignmentDate${i}" placeholder="Enter due date for the assignment">

            <label for="assignmentWeight${i}">Assignment Weight</label>
            <input type="number" class="form-control" id="assignmentWeight${i}" required min="0" max="1" step=".01" placeholder="Enter weight for the assignment (%)">
        `;
        assignmentsContainer.appendChild(assignmentDiv);
    }
});


document.getElementById("classform").addEventListener('submit', async(e)=> {
    e.preventDefault();



    // get Exam data
    const examName = document.getElementById("examName").value;
    const examDescription = document.getElementById("examDescription").value;
    const examDate = document.getElementById("examDate").value;
    const examWeight = parseFloat(document.getElementById("examWeight").value);

    // create Exam Object
    const exam = {examName, examDescription, examDate, examWeight}

    // Get Assignments data
    const numAssignments = document.getElementById('numAssignments').value;
    const assignments = [];

    let totalAssignmentWeight = 0;

    for (let i = 1; i <= numAssignments; i++) {
        const assignmentName = document.getElementById(`assignmentName${i}`).value;
        const assignmentDescription = document.getElementById(`assignmentDescription${i}`).value;
        const assignmentDate = document.getElementById(`assignmentDate${i}`).value;
        const assignmentWeight = parseFloat(document.getElementById(`assignmentWeight${i}`).value);

        totalAssignmentWeight += assignmentWeight;

        assignments.push({ assignmentName, assignmentDescription, assignmentDate, assignmentWeight });
    }

    const CourseId = localStorage.getItem('courseId')

    // Create course object with nested exam and assignments
    const Data = {
        exam,
        assignments,
        CourseId,
    };

    // Send course data to backend
    try {
        const response = await fetch('http://localhost:3000/api/examAssinmemnt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });
        const result = await response.json();
        if (response.ok) {
            // Store the teacherId in local storage
            localStorage.removeItem('courseId')
             
            // You can redirect the user to the dashboard or another page after login
            window.location.href = 'Home.html';

            alert('exam, and assignments created successfully!');
        } else {
            alert(result.message || 'Failed to create course.');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
})