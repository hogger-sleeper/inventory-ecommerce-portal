const SUPABASE_URL = "https://xgovcfyeewdvycgudqza.supabase.co";
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnb3ZjZnllZXdkdnljZ3VkcXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjMyMTYsImV4cCI6MjA1OTkzOTIxNn0.0WTF7ofCPWicpGUsFzCTT2mLgm85mDo3VH35t3EVbsg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadCatalog() {
    const table = document.getElementById('catalog-table');
    const { data } = await supabase.from('products').select();
    table.innerHTML = '<tr><th>Name</th><th>Price</th><th>Quantity</th><th>Update</th></tr>' +
        data.map(p => `
        <tr>
          <td>${p.name}</td>
          <td><input type="number" id="price-${p.id}" value="${p.price}"></td>
          <td><input type="number" id="qty-${p.id}" value="${p.quantity}"></td>
          <td><button onclick="updateProduct('${p.id}')">Save</button></td>
        </tr>`).join('');
}


async function updateProduct(id) {
    const price = parseFloat(document.getElementById(`price-${id}`).value);
    const quantity = parseInt(document.getElementById(`qty-${id}`).value);
    await supabase.from('products').update({ price, quantity }).eq('id', id);
    loadCatalog();
}



async function loadMessages() {
    const table = document.getElementById('messages');
    const { data } = await supabase.from('messages').select();
    table.innerHTML = '<tr><th>Content</th></tr>' +
        data.map(m => `
        <tr>
          <td>${m.content}</td>
        </tr>`).join('');

}


async function loadLowStockWarnings() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('quantity', 5);

    if (error) {
        console.error('Error loading low stock:', error.message);
        return;
    }

    console.log('Low stock data:', data); // <-- Add this line

    displayLowStockWarnings(data);
}


function displayLowStockWarnings(products) {
    const warningContainer = document.getElementById('warning-messages');

    if (products.length === 0) {
        warningContainer.innerHTML = '<p>No low stock warnings.</p>';
        return;
    }

    // Clear any existing content
    warningContainer.innerHTML = '';

    // Add a warning for each low-stock product
    products.forEach(product => {
        const message = document.createElement('p');
        message.textContent = `⚠️ ${product.name} is low on stock (only ${product.quantity} left)`;
        message.style.color = 'red'; // Optional: Make it stand out
        warningContainer.appendChild(message);
    });
}

window.onload = () => {
    loadLowStockWarnings();
    // You can also call other functions like loadCatalog(), etc.
};

window.addEventListener('DOMContentLoaded', () => {
    loadLowStockWarnings();
});

window.onload = () => {
    loadCatalog();
    loadMessages();
    setInterval(loadMessages, 5000);
};
