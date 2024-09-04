document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        showNotification('Teacher ID not found in local storage.', 'error');
        return;
    }

    // Load the courses for the teacher
    try {
        const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/courses`);
        const courses = await response.json();

        if (response.ok) {
            const classSelect = document.getElementById('classSelect');
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.courseName;
                classSelect.appendChild(option);
            });

            // Automatically set the first course as selected
            if (courses.length > 0) {
                classSelect.value = courses[0].id;
            }
        } else {
            showNotification('Failed to load courses: ' + courses.message, 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses: ' + error.message, 'error');
    }

    // Handle form submission to create a new lesson and attendance records
    document.getElementById('addLessonForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const lessonDate = document.getElementById('lessonDate').value;
        const courseId = document.getElementById('classSelect').value;

        // Ensure the date is in the correct format
        const formattedDate = new Date(lessonDate).toISOString().split('T')[0];

        if (!lessonDate || !courseId) {
            showNotification('Please select a date and course.', 'error');
            return;
        }

        // Save the lesson date to localStorage
        let lessonDates = JSON.parse(localStorage.getItem('lessonDates')) || [];
        lessonDates.push(formattedDate);
        localStorage.setItem('lessonDates', JSON.stringify(lessonDates));

        // Fetch students enrolled in the selected course
        try {
            const studentResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/students`);
            const students = await studentResponse.json();

            if (studentResponse.ok) {
                // Create an attendance record for each student with a default status of 'T'
                for (const student of students) {
                    await fetch('http://localhost:3000/api/attendance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            studentId: student.id,
                            courseId,
                            date: formattedDate, // Use the formatted date
                            status: 'T'
                        })
                    });
                }
                showNotification('Attendance records created successfully!', 'success');
            } else {
                showNotification('Failed to fetch students: ' + students.message, 'error');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showNotification('Error fetching students: ' + error.message, 'error');
        }

        // Redirect back to the attendance page
        window.location.href = 'attendance.html';
    });
});

// Function to show a custom notification
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
