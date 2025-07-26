const { createApp } = Vue;

const { createClient } = supabase;
const supabaseUrl = "https://wrdgfwttajpeuqjnqjdh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZGdmd3R0YWpwZXVxam5xamRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODE1MDUsImV4cCI6MjA2ODg1NzUwNX0.89VKqxdmWSSie7vmqZd9P3u_TDD5IXw2FkYfM5AQz6Y";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

createApp({
    data() {
        return {
            view: 'login',
            loginForm: { email: '', password: '' },
            registerForm: { fname: '', lname: '', email: '', password: '', country: '' },
            currentUser: null,
            users: [],
            newTask: { name: '', desc: '', date: '' },
            tasks: []
        };
    },
    methods: {
        // login() {
        //     const user = this.users.find(
        //         u => u.email === this.loginForm.email && u.password === this.loginForm.password
        //     );
        //     if (user) {
        //         this.currentUser = user;
        //         this.view = 'todo';
        //     } else {
        //         alert("Invalid email or password");
        //     }
        // },
        async login() {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
              email: this.loginForm.email,    // fixed from useremail → email
              password: this.loginForm.password
            });
            if (error) return alert(error.message);
            this.currentUser = data.user;     // fixed: use data.user (object)
            await this.fetchTasks();          // load tasks from Supabase
            this.view = 'todo';
        },

        // register() {
        //     const exists = this.users.some(u => u.email === this.registerForm.email);
        //     if (exists) return alert("Email already exists!");
        //     this.users.push({ ...this.registerForm });
        //     alert("Registration successful! Please login.");
        //     this.view = 'login';
        // },
        async register() {
            const { data, error } = await supabaseClient.auth.signUp({
              email: this.registerForm.email,    // fixed from useremail → email
              password: this.registerForm.password,
              options: {
                data: {
                    fname: this.registerForm.fname,
                    lname: this.registerForm.lname,
                    country: this.registerForm.country
                }
              }
            });
            if (error) return alert(error.message);
            alert("Registration successful! Please verify your email.");
            this.view = 'login';
        },

        // addTask() {
        //     if (!this.newTask.name.trim()) return alert("Task name required");
        //     this.tasks.push({ ...this.newTask });
        //     this.newTask = { name: '', desc: '', date: '' };
        // }, Could not find the 'user_id' column of 'tasks' in the schema cache
        async addTask() {
            if (!this.newTask.name) return alert("Task name required");
            const { error } = await supabaseClient.from('tasks').insert([{
                user_id: this.currentUser.id,  // <-- this is a UUID
                name: this.newTask.name,
                description: this.newTask.desc,
                due_date: this.newTask.date
              }]);
              
            if (error) return alert(error.message);
            this.fetchTasks();
            this.newTask = { name: '', desc: '', date: '' };
        },

        // removeTask(index) {
        //     this.tasks.splice(index, 1);
        // },
        async removeTask(index) {
            const task = this.tasks[index];
            await supabaseClient.from('tasks').delete().eq('id', task.id);
            this.fetchTasks();
        },

        async fetchTasks() {
            const { data, error } = await supabaseClient
              .from('tasks')
              .select('*')
              .eq('user_id', this.currentUser.id);
            if (!error) this.tasks = data;
        },   

        async logout() {
            await supabaseClient.auth.signOut();
            this.currentUser = null;
            this.view = 'login';
            this.tasks = [];
        }
    }
}).mount('#app');
