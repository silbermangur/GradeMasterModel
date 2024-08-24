document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');
    const studentId = localStorage.getItem('studentId');

    if (!teacherId || !studentId) {
        alert('Teacher ID or Student ID not found in local storage.');
        return;
    }

    // Load the courses for the teacher
    try {
        const response = await fetch(`http://localhost:3000/api/teacher/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const courseList = document.getElementById('courseList');
            courses.forEach(course => {
                const courseCheckbox = document.createElement('div');
                courseCheckbox.className = 'form-check';
                courseCheckbox.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${course.id}" id="course${course.id}">
                    <label class="form-check-label" for="course${course.id}">
                        ${course.courseName}
                    </label>
                `;
                courseList.appendChild(courseCheckbox);
            });
        } else {
            alert('Failed to load courses: ' + courses.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Error loading courses: ' + error.message);
    }

    // Handle form submission
    document.getElementById('courseAssignmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const selectedCourses = [];
        document.querySelectorAll('#courseList input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCourses.push(checkbox.value);
        });

        if (selectedCourses.length === 0) {
            alert('Please select at least one course.');
            return;
        }

        try {
            for (const courseId of selectedCourses) {
                await fetch('http://localhost:3000/api/enrollment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId,
                        courseId,
                        enrollmentDate: new Date().toISOString().split('T')[0],  // Use the current date
                        finalGrade: 0.0, 
                        
                    })
                });
            }

            alert('Student successfully enrollment to courses!');
            window.location.href = 'students.html'; // Redirect back to the student management page
        } catch (error) {
            console.error('Error assigning student to courses:', error);
            alert('Error assigning student to courses: ' + error.message);
        }
    });
});
