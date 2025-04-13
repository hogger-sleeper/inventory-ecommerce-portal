const SUPABASE_URL = "https://xgovcfyeewdvycgudqza.supabase.co";
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnb3ZjZnllZXdkdnljZ3VkcXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjMyMTYsImV4cCI6MjA1OTkzOTIxNn0.0WTF7ofCPWicpGUsFzCTT2mLgm85mDo3VH35t3EVbsg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    const { data: userData } = await supabase.from('users').select().eq('email', email).single();
    if (userData.role !== role) return alert("Invalid role");

    window.location.href = role === 'buyer' ? 'buyer.html' : 'seller.html';
}