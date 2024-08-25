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
                ? 'http://localhost:3000/api/assignment-submissions'
                : 'http://localhost:3000/api/exam-submissions';

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
                alert('Grade saved successfully!');
                window.location.href = 'grades.html';
            } else {
                alert('Failed to save grade: ' + (await response.json()).message);
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            alert('Error saving grade: ' + error.message);
        }
    });
});
