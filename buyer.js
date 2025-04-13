// buyer.js

const SUPABASE_URL = "https://xgovcfyeewdvycgudqza.supabase.co";
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnb3ZjZnllZXdkdnljZ3VkcXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjMyMTYsImV4cCI6MjA1OTkzOTIxNn0.0WTF7ofCPWicpGUsFzCTT2mLgm85mDo3VH35t3EVbsg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProducts() {
    const table = document.getElementById('product-table');
    const { data } = await supabase.from('products').select();
    table.innerHTML = '<tr><th>Name</th><th>Price</th><th>Qty</th><th>Action</th></tr>' +
        data.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.price}</td>
          <td>${p.quantity}</td>
          <td><input type="number" min="1" max="${p.quantity}" id="qty-${p.id}">
          <button onclick="buyProduct('${p.id}', '${p.name}', ${p.quantity})">Buy</button></td>
        </tr>`).join('');
}
async function buyProduct(id, name, availableQty) {
    const qty = parseInt(document.getElementById(`qty-${id}`).value);
    if (qty > availableQty) {
        await supabase.from('orders').insert({ product_id: id, quantity: qty, status: 'requested' });
        await supabase.from('messages').insert({ type: 'request', content: `Buyer requested more of ${name} and ${qty - availableQty}` });
    } else {
        await supabase.from('orders').insert({ product_id: id, quantity: qty, status: 'confirmed' });
        await supabase.from('products').update({ quantity: availableQty - qty }).eq('id', id);
    }
    loadProducts();
}

function displayProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    products.forEach((product) => {
        const card = document.createElement('div');
        card.innerHTML = `
        <h3>${product.name}</h3>
        <p>Price: ₹${product.price}</p>
        <p>Quantity: ${product.quantity}</p>
        ${product.quantity > 0
                ? `<button onclick="buyProduct('${product.product_id}', ${product.quantity})">Buy</button>`
                : `<input type="number" id="request-${product.product_id}" placeholder="Qty" min="1">
               <button onclick="requestMore('${product.product_id}')">Request More</button>`
            }
      `;
        container.appendChild(card);
    });
}

async function requestMore(productId) {
    const qty = parseInt(document.getElementById(`request-${productId}`).value);
    const buyerEmail = prompt('Enter your email to request more stock:');

    if (!qty || !buyerEmail) {
        alert('Please enter quantity and email.');
        return;
    }

    const { data, error } = await supabase.from('requests').insert([
        {
            product_id: productId,
            buyer_email: buyerEmail,
            requested_qty: qty,
        },
    ]);

    if (error) {
        console.error('Error requesting more:', error.message);
        alert('Failed to request more.');
    } else {
        alert('Request submitted to seller!');
    }
}
async function loadBuyerRequests() {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading buyer requests:', error.message);
        return;
    }

    displayBuyerRequests(data);
}

function displayBuyerRequests(requests) {
    const reqContainer = document.getElementById('request-messages');
    reqContainer.innerHTML = '';

    if (requests.length === 0) {
        reqContainer.innerHTML = '<p>No buyer requests 🚫</p>';
        return;
    }

    requests.forEach((req) => {
        const msg = document.createElement('div');
        msg.innerHTML = `
        📩 <strong>${req.buyer_email}</strong> requested <strong>${req.requested_qty}</strong> of product ID <strong>${req.product_id}</strong>
      `;
        reqContainer.appendChild(msg);
    });
}
window.onload = () => {
    loadLowStockWarnings();
    loadBuyerRequests();
};



window.onload = loadProducts;