import { supabase } from "./supabase.js";


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");


        message.textContent = "Logging in...";
        message.className = "message";


        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            message.textContent =
                "Login failed: " + error.message;

            message.className = "message error";

            return;
        }


        message.textContent =
            "Login successful!";

        message.className = "message success";


        setTimeout(function () {

            window.location.href = "index.html";

        }, 500);

    });

}



// ==========================================
// CHECK LOGIN
// ==========================================

export async function checkUser() {

    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href = "login.html";

        return null;
    }


    return user;
}



// ==========================================
// LOGOUT
// ==========================================

export async function logout() {

    const { error } =
        await supabase.auth.signOut();


    if (error) {

        alert(error.message);

        return;
    }


    window.location.href = "login.html";
}