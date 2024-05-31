// Add event listener to run the script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const newTaskForm = document.getElementById('new-task-form');
    const pendingTasks = document.getElementById('pending-tasks');
    const inProgressTasks = document.getElementById('in-progress-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    let draggedTask = null;

    // Load tasks from localStorage on page load
    loadTasks();

    // Event listener to handle new task form submission
    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        addTask(title, desc);
        newTaskForm.reset();
    });

    // Function to add a new task to the Pending section
    function addTask(title, desc) {
        const task = createTaskElement(title, desc, 'pending');
        pendingTasks.appendChild(task);
        saveTasks();
    }

    // Function to create a task element
    function createTaskElement(title, desc, section) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.setAttribute('draggable', 'true');
        task.innerHTML = `
            <div>
                <strong>${title}</strong>
                <p>${desc}</p>
            </div>
        `;

        addButton(task, section);
        addDeleteButton(task);

        // Add drag and drop event listeners to the task element
        task.addEventListener('dragstart', () => {
            draggedTask = task;
            task.classList.add('dragging');
        });

        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
            draggedTask = null;
        });

        return task;
    }

    // Function to add a button to a task element based on its section
    function addButton(task, section) {
        const button = document.createElement('button');
        if (section === 'pending') {
            button.innerText = 'Start';
            button.addEventListener('click', () => moveTask(task, 'in-progress'));
        } else if (section === 'in-progress') {
            button.innerText = 'Complete';
            button.addEventListener('click', () => moveTask(task, 'completed'));
        }
        task.appendChild(button);
    }

    // Function to add a delete button to a task element
    function addDeleteButton(task) {
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => {
            task.remove();
            saveTasks();
        });
        task.appendChild(deleteButton);
    }

    // Function to move a task to a different section
    function moveTask(task, section) {
        if (section === 'in-progress') {
            const newTask = createTaskElement(
                task.querySelector('strong').innerText,
                task.querySelector('p').innerText,
                'in-progress'
            );
            inProgressTasks.appendChild(newTask);
        } else if (section === 'completed') {
            const newTask = createTaskElement(
                task.querySelector('strong').innerText,
                task.querySelector('p').innerText,
                'completed'
            );
            const timestamp = document.createElement('p');
            const now = new Date();
            timestamp.innerText = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            newTask.appendChild(timestamp);
            completedTasks.appendChild(newTask);
        }
        task.remove();
        saveTasks();
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        const pending = Array.from(pendingTasks.children).map(task => ({
            title: task.querySelector('strong').innerText,
            desc: task.querySelector('p').innerText
        }));
        const inProgress = Array.from(inProgressTasks.children).map(task => ({
            title: task.querySelector('strong').innerText,
            desc: task.querySelector('p').innerText
        }));
        const completed = Array.from(completedTasks.children).map(task => ({
            title: task.querySelector('strong').innerText,
            desc: task.querySelector('p').innerText,
            timestamp: task.querySelector('p:last-child').innerText
        }));
        localStorage.setItem('tasks', JSON.stringify({ pending, inProgress, completed }));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || { pending: [], inProgress: [], completed: [] };
        tasks.pending.forEach(task => {
            const taskElement = createTaskElement(task.title, task.desc, 'pending');
            pendingTasks.appendChild(taskElement);
        });
        tasks.inProgress.forEach(task => {
            const taskElement = createTaskElement(task.title, task.desc, 'in-progress');
            inProgressTasks.appendChild(taskElement);
        });
        tasks.completed.forEach(task => {
            const taskElement = createTaskElement(task.title, task.desc, 'completed');
            const timestamp = document.createElement('p');
            timestamp.innerText = task.timestamp;
            taskElement.appendChild(timestamp);
            completedTasks.appendChild(taskElement);
        });
    }

    // Drag and drop event listeners for task sections
    [pendingTasks, inProgressTasks, completedTasks].forEach(section => {
        section.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.task.dragging');
            section.appendChild(draggingTask);
        });

        section.addEventListener('drop', () => {
            if (draggedTask) {
                if (section.id === 'pending-tasks' || section.id === 'in-progress-tasks') {
                    // Remove timestamp immediately upon drop
                    const timestamp = draggedTask.querySelector('p:last-child');
                    if (timestamp && timestamp.innerText.match(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/)) {
                        timestamp.remove();
                    }
                    updateTask(draggedTask, section.id === 'pending-tasks' ? 'pending' : 'in-progress');
                } else if (section.id === 'completed-tasks') {
                    moveTask(draggedTask, 'completed');
                }
                saveTasks();
            }
        });
    });

    // Function to update a task's button and move it to the appropriate section
    function updateTask(task, section) {
        // Remove existing buttons
        const button = task.querySelector('button:not(.delete)');
        if (button) button.remove();

        addButton(task, section);
        addDeleteButton(task);

        if (section === 'pending') {
            pendingTasks.appendChild(task);
        } else if (section === 'in-progress') {
            inProgressTasks.appendChild(task);
        }
    }
});
