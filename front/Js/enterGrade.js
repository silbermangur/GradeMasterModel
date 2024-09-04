document.addEventListener('DOMContentLoaded', function() {
    const gradeType = localStorage.getItem('gradeType'); // "assignment" or "exam"
    const gradeId = localStorage.getItem('gradeId');
    const studentId = localStorage.getItem('studentId');

    if (!gradeType || !gradeId || !studentId) {
        alert('Missing information for entering grade.');
        window.location.href = 'grades.html';
        return;
    }

    document.getElementById('enterGradeForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const pointsEarned = document.getElementById('pointsEarned').value;

        if (!pointsEarned) {
            alert('Please enter a grade.');
            return;
        }

        try {
            const endpoint = gradeType === 'assignment' 
                ? 'http://localhost:3000/api/submissions/assignment'
                : 'http://localhost:3000/api/submissions/exam';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [gradeType === 'assignment' ? 'assignmentId' : 'examId']: gradeId,
                    studentId,
                    pointsEarned
                })
            });

            if (response.ok) {
                showNotification('Grade saved successfully!','success');
                window.location.href = 'grades.html';
            } else {
                showNotification('Failed to save grade: ' + (await response.json()).message, 'error');
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            showNotification('Error saving grade: ' + error.message, 'error');
        }
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
