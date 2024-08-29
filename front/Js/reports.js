document.addEventListener('DOMContentLoaded', function() {
    const teacherId = localStorage.getItem('teacherId');

    // Load courses for the teacher
    fetch(`http://localhost:3000/api/teachers/${teacherId}/courses`)
        .then(response => response.json())
        .then(courses => {
            const classSelect = document.getElementById('classSelect');
            const downloadButton = document.getElementById('downloadReport');
            

            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.courseName;
                classSelect.appendChild(option);
            });

            // Enable the download button if there are courses
            if (courses.length > 0) {
                downloadButton.classList.remove('disabled');
                downloadButton.removeAttribute('disabled');
            }

            // Ensure download link is enabled when a course is selected
            classSelect.addEventListener('change', function() {
                downloadButton.classList.remove('disabled');
                downloadButton.removeAttribute('disabled');
            });
        })
        .catch(error => console.error('Error loading courses:', error));

    // Handle report generation and download on click
    document.getElementById('downloadReport').addEventListener('click', function(e) {
        e.preventDefault();  // Ensure no form submission or page reload

        const courseId = document.getElementById('classSelect').value;
        const downloadButton = document.getElementById('downloadReport');

        // Disable the button during report generation
        downloadButton.classList.add('disabled');
        downloadButton.setAttribute('disabled', 'true');

        fetch(`http://localhost:3000/api/courses/${courseId}/report`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to generate report');
                return response.blob(); // Download the PDF as a Blob
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `course_${courseId}_report.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Re-enable the button after the report is generated
                downloadButton.classList.remove('disabled');
                downloadButton.removeAttribute('disabled');
            })
            .catch(error => {
                console.error('Error generating report:', error);
                alert('Error generating report: ' + error.message);

                // Re-enable the button even if there's an error
                downloadButton.classList.remove('disabled');
                downloadButton.removeAttribute('disabled');
            });
    });
});
