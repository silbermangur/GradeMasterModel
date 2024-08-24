document.addEventListener('DOMContentLoaded', async () => {
    const teacherList = document.getElementById('teacherList');

    try {
        // Fetch the list of teachers from the backend
        const response = await fetch('http://localhost:3000/api/teachers');
        const teachers = await response.json();

        // Check if the response is an array of teachers
        if (Array.isArray(teachers)) {
            teachers.forEach(teacher => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = `${teacher.firstName} ${teacher.lastName} - ${teacher.email} - ${teacher.password} - ${teacher.phoneNumber}`;
                teacherList.appendChild(listItem);
            });
        } else {
            teacherList.textContent = 'No teachers found.';
        }
    } catch (error) {
        teacherList.textContent = 'Error loading teachers: ' + error.message;
    }
});
