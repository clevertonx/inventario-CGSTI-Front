document.getElementById('showRegister').addEventListener('click', function() {
    document.querySelector('.login-container').classList.remove('active');
    document.querySelector('.register-container').classList.add('active');
});

document.getElementById('showLogin').addEventListener('click', function() {
    document.querySelector('.register-container').classList.remove('active');
    document.querySelector('.login-container').classList.add('active');
});

  // Handle form submission for registration
  document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('usuario_cad').value;
    const email = document.getElementById('email_cad').value;
    const password = document.getElementById('senha_cad').value;

    try {
        const response = await axios.post('http://localhost:8080/usuario/registrar', { username, email, senha: password }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response);
        if (response.status === 201) {
            alert('Usuário registrado com sucesso!');
            document.getElementById('showLogin').click();
        } else {
            alert('Erro ao registrar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao registrar usuário');
    }
});


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('usuario_login').value;
    const password = document.getElementById('senha_login').value;

    try {
        const response = await axios.post('http://localhost:8080/usuario/login', { username, senha: password }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            alert('Login bem-sucedido!');
            window.location.href = 'http://http://10.8.4.71:5500/inventario.html'; 
        } else if (response.status === 401) {
            alert('Credenciais inválidas');
        } else {
            alert('Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer login');
    }
});