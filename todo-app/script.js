// Local Storage Manager
const StorageManager = {
    STORAGE_KEY: 'todoList',
    
    getTodos() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    saveTodos(todos) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    },
    
    addTodo(text) {
        const todos = this.getTodos();
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        todos.push(newTodo);
        this.saveTodos(todos);
        return newTodo;
    },
    
    deleteTodo(id) {
        const todos = this.getTodos();
        const filtered = todos.filter(todo => todo.id !== id);
        this.saveTodos(filtered);
    },
    
    updateTodo(id, text) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.text = text.trim();
            this.saveTodos(todos);
        }
    },
    
    toggleTodo(id) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(todos);
        }
    },
    
    deleteCompleted() {
        const todos = this.getTodos();
        const filtered = todos.filter(todo => !todo.completed);
        this.saveTodos(filtered);
    },
    
    deleteAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// UI Manager
const UIManager = {
    todoInput: document.getElementById('todoInput'),
    addBtn: document.getElementById('addBtn'),
    todoList: document.getElementById('todoList'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    clearCompletedBtn: document.getElementById('clearCompleted'),
    deleteAllBtn: document.getElementById('deleteAll'),
    totalCount: document.getElementById('totalCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    
    currentFilter: 'all',
    editingId: null,
    
    init() {
        this.attachEventListeners();
        this.render();
    },
    
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.handleAddTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTodo();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        this.deleteAllBtn.addEventListener('click', () => this.handleDeleteAll());
    },
    
    handleAddTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            alert('Please enter a task!');
            this.todoInput.focus();
            return;
        }
        
        StorageManager.addTodo(text);
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    },
    
    handleFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    },
    
    handleClearCompleted() {
        if (confirm('Are you sure you want to delete all completed tasks?')) {
            StorageManager.deleteCompleted();
            this.render();
        }
    },
    
    handleDeleteAll() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            StorageManager.deleteAll();
            this.render();
        }
    },
    
    handleToggleTodo(id) {
        StorageManager.toggleTodo(id);
        this.render();
    },
    
    handleDeleteTodo(id) {
        if (confirm('Delete this task?')) {
            StorageManager.deleteTodo(id);
            this.render();
        }
    },
    
    handleEditTodo(id) {
        const todos = StorageManager.getTodos();
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        const item = document.getElementById(`todo-${id}`);
        const textSpan = item.querySelector('.todo-text');
        const actionsDiv = item.querySelector('.todo-actions');
        
        // Create edit input and buttons
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = todo.text;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => this.handleSaveEdit(id, editInput.value));
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => this.render());
        
        // Hide original content and show edit mode
        item.classList.add('edit-mode');
        textSpan.style.display = 'none';
        actionsDiv.innerHTML = '';
        
        const editActionsDiv = document.createElement('div');
        editActionsDiv.className = 'todo-actions';
        editActionsDiv.appendChild(saveBtn);
        editActionsDiv.appendChild(cancelBtn);
        
        item.insertBefore(editInput, actionsDiv);
        item.replaceChild(editActionsDiv, actionsDiv);
        
        editInput.focus();
        editInput.select();
    },
    
    handleSaveEdit(id, text) {
        if (text.trim() === '') {
            alert('Task cannot be empty!');
            return;
        }
        StorageManager.updateTodo(id, text);
        this.render();
    },
    
    getFilteredTodos() {
        const todos = StorageManager.getTodos();
        
        switch(this.currentFilter) {
            case 'active':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    },
    
    updateStats() {
        const todos = StorageManager.getTodos();
        const completed = todos.filter(t => t.completed).length;
        const active = todos.length - completed;
        
        this.totalCount.textContent = todos.length;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    },
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <p>📝 No tasks to show. Create one to get started!</p>
                </div>
            `;
            this.updateStats();
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.id = `todo-${todo.id}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" data-id="${todo.id}">Edit</button>
                    <button class="delete-btn-item" data-id="${todo.id}">Delete</button>
                </div>
            `;
            
            // Checkbox listener
            const checkbox = li.querySelector('.checkbox');
            checkbox.addEventListener('change', () => this.handleToggleTodo(todo.id));
            
            // Edit button listener
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => this.handleEditTodo(todo.id));
            
            // Delete button listener
            const deleteBtn = li.querySelector('.delete-btn-item');
            deleteBtn.addEventListener('click', () => this.handleDeleteTodo(todo.id));
            
            this.todoList.appendChild(li);
        });
        
        this.updateStats();
        this.deleteAllBtn.disabled = StorageManager.getTodos().length === 0;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
