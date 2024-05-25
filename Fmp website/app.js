// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlagYWSc30WXosMnK3IP3y93er33JqnoE",
    authDomain: "fmpweb-9015b.firebaseapp.com",
    projectId: "fmpweb-9015b",
    storageBucket: "fmpweb-9015b.appspot.com",
    databaseURL: "https://fmpweb-9015b-default-rtdb.firebaseio.com",
    messagingSenderId: "950316092660",
    appId: "1:950316092660:web:70bb36385f1ea5b6dc22a1"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  
  document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartCount = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    
    let totalPrice = 0;
  
    document.querySelectorAll('.btn-primary').forEach(button => {
      button.addEventListener('click', (event) => {
        const productElement = event.target.closest('.col-md-3');
        const productName = productElement.querySelector('h4').textContent;
        const priceText = productElement.querySelector('.text-danger').textContent;
        const price = parseInt(priceText.replace('Rs. ', ''));
  
        addToCart(productName, price);
        updateCart();
      });
    });
  
    function addToCart(productName, price) {
      cart.push({ name: productName, price: price });
      totalPrice += price;
    }
  
    function updateCart() {
      cartItemsContainer.innerHTML = '';
      cart.forEach((item, index) => {
        const cartItem = document.createElement('li');
        cartItem.className = 'dropdown-item d-flex justify-content-between align-items-center';
        cartItem.innerHTML = `
          ${item.name} - Rs. ${item.price}
          <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
      });
      totalPriceElement.textContent = `Rs. ${totalPrice}`;
      cartCount.textContent = cart.length;
    }
  
    window.removeFromCart = (index) => {
      totalPrice -= cart[index].price;
      cart.splice(index, 1);
      updateCart();
    };
  
    placeOrderBtn.addEventListener('click', () => {
      orderModal.show();
    });
  
    document.getElementById('orderForm').addEventListener('submit', processOrder);
  
    function processOrder(event) {
      event.preventDefault(); // Prevent form submission
  
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const mobile = document.getElementById('mobile').value;
      const address = document.getElementById('address').value;
  
      if (fullName && email && mobile && address) {
        // Create a new order object.
        const order = {
          fullName: fullName,
          email: email,
          mobile: mobile,
          address: address,
          items: cart,
          totalPrice: totalPrice,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        };
  
        // Save the order to the database.
        const ordersRef = firebase.database().ref('orders');
        ordersRef.push(order)
          .then(() => {
            // Clear cart and form
            cart.length = 0;
            totalPrice = 0;
            updateCart();
            document.getElementById('orderForm').reset(); // Ensure your form has id='orderForm'
  
            // Show success message
            Swal.fire({
              title: "Order Placed!",
              text: "Your order has been successfully processed.",
              icon: "success",
            }).then(() => {
              // Hide the order modal after showing the success message
              orderModal.hide();
            });
          })
          .catch((error) => {
            console.error("Error saving order to database:", error);
  
            // Show error message
            Swal.fire({
              title: "Error",
              text: "An error occurred while processing your order. Please try again later.",
              icon: "error",
            });
          });
      } else {
        Swal.fire({
          title: "Incomplete Information",
          text: "Please fill all the fields to place your order.",
          icon: "warning",
        });
      }
    }
  });
  