document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        showNotification('Teacher ID not found in local storage.', 'error');
        return;
    }

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

            // Automatically load students and attendance for the first course
            if (courses.length > 0) {
                await loadAttendance(courses[0].id);
            }

            // Load students and attendance when a course is selected
            classSelect.addEventListener('change', async function() {
                const courseId = this.value;
                await loadAttendance(courseId);
            });

        } else {
            showNotification('Failed to load courses: ' + courses.message, 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses: ' + error.message, 'error');
    }

    // Handle "Add Lesson" button click
    document.getElementById('addLessonBtn').addEventListener('click', function() {
        window.location.href = 'addLesson.html';
    });
});

// Function to load students and their attendance for a specific course
async function loadAttendance(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/attendance`);
        const data = await response.json();

        if (response.ok) {
            const attendanceTableContainer = document.getElementById('attendanceTableContainer');
            attendanceTableContainer.innerHTML = ''; // Clear previous table

            const { students, dates } = data;

            // Create attendance table
            const table = document.createElement('table');
            table.className = 'table table-bordered';

            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th>Student Name</th>';
            dates.forEach(date => {
                const th = document.createElement('th');
                th.textContent = new Date(date).toLocaleDateString('he-IL');
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${student.firstName} ${student.lastName}</td>`;
                dates.forEach(date => {
                    const td = document.createElement('td');
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.className = 'attendance-wrapper';

                    const select = document.createElement('select');
                    select.className = 'form-control';
                    select.innerHTML = `
                        <option value="T" ${student.attendance[date] === 'T' ? 'selected' : ''}>T</option>
                        <option value="F" ${student.attendance[date] === 'F' ? 'selected' : ''}>F</option>
                    `;
                    select.addEventListener('change', async function() {
                        await updateAttendance(student.id, courseId, date, this.value);
                    });

                    const removeButton = document.createElement('button');
                    removeButton.className = 'btn btn-danger btn-sm';
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', async function() {
                        await removeAttendance(courseId, date);
                    });

                    wrapperDiv.appendChild(select);
                    wrapperDiv.appendChild(removeButton);
                    td.appendChild(wrapperDiv);
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            attendanceTableContainer.appendChild(table);
        } else {
            showNotification('Failed to load attendance: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showNotification('Error loading attendance: ' + error.message, 'error');
    }
}

// Function to update attendance for a specific student and date
async function updateAttendance(studentId, courseId, date, status) {
    try {
        const response = await fetch('http://localhost:3000/api/attendance', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId,
                courseId,
                date,
                status
            })
        });

        if (!response.ok) {
            showNotification('Failed to update attendance', 'error');
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        showNotification('Error updating attendance: ' + error.message, 'error');
    }
}

// Function to remove attendance for a specific date and course
async function removeAttendance(courseId, date) {
    if (confirm('Are you sure you want to this attendance records for this date?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/attendance/${courseId}/attendance/${date}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification('Attendance removed successfully', 'success');
                await loadAttendance(courseId); // Reload the attendance table
            } else {
                const result = await response.json();
                showNotification('Failed to remove attendance: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error removing attendance:', error);
            showNotification('Error removing attendance: ' + error.message, 'error');
        }
    }
}

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
