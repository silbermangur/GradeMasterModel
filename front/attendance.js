document.addEventListener('DOMContentLoaded', async function() {
    const teacherId = localStorage.getItem('teacherId');

    if (!teacherId) {
        alert('Teacher ID not found in local storage.');
        return;
    }

    // Load the courses for the teacher
    try {
        const response = await fetch(`http://localhost:3000/api/teacher/${teacherId}/courses`);
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
            alert('Failed to load courses: ' + courses.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Error loading courses: ' + error.message);
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
        const attendanceData = await response.json();

        if (response.ok) {
            const attendanceTableContainer = document.getElementById('attendanceTableContainer');
            attendanceTableContainer.innerHTML = ''; // Clear previous table

            // Retrieve lesson dates from localStorage
            let lessonDates = JSON.parse(localStorage.getItem('lessonDates')) || [];

            // Create attendance table
            const table = document.createElement('table');
            table.className = 'table table-bordered';

            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th>שם הסטודנט</th>';
            lessonDates.forEach(date => {
                const th = document.createElement('th');
                th.textContent = new Date(date).toLocaleDateString('he-IL');
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            attendanceData.students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${student.firstName} ${student.lastName}</td>`;
                lessonDates.forEach(date => {
                    const td = document.createElement('td');
                    const select = document.createElement('select');
                    select.className = 'form-control';
                    select.innerHTML = `
                        <option value="T" ${student.attendance[date] === 'T' ? 'selected' : ''}>T</option>
                        <option value="F" ${student.attendance[date] === 'F' ? 'selected' : ''}>F</option>
                    `;
                    select.addEventListener('change', async function() {
                        await updateAttendance(student.id, courseId, date, this.value);
                    });
                    td.appendChild(select);
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            attendanceTableContainer.appendChild(table);
        } else {
            alert('Failed to load attendance: ' + attendanceData.message);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        alert('Error loading attendance: ' + error.message);
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
            console.log(`Looking for attendance record: studentId=${studentId}, courseId=${courseId}, date=${date}`);

            alert('Failed to update attendance');
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        alert('Error updating attendance: ' + error.message);
    }
}
