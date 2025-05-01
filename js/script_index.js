addEventListener('load', function() {
    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];

    let chat_1_element = document.getElementById('chat_1');
    let chat_2_element = document.getElementById('chat_2');
    let chat_hack_element = document.getElementById('chat_hack');

    let information_julie = JSON.parse(localStorage.getItem('information_julie')) || null;
    let information_tom = JSON.parse(localStorage.getItem('information_tom')) || null;

    function generate_user_keys(storageKey) {
        let [ p, q ] = choose_prime_number();
        let n = calculate_n( p, q );
        let phi_n = var_phi( p, q );
        let e = define_e( phi_n );
        let d = mod_inverse( e, phi_n );
        
        let user_information = {
            public_key : { e: e.toString(), n: n.toString() }, 
            private_key : { d: d.toString(), n: n.toString() }
        }

        localStorage.setItem(storageKey, JSON.stringify(user_information));
    }

    if (!information_tom) generate_user_keys('information_tom');
    if (!information_julie) generate_user_keys('information_julie');

    function display_message_for_julie(message, chatElement) {
        let screen = chatElement.querySelector('.screen');
        for (let msg of message) {
            let decrypted_message;
            
            let new_message = document.createElement('div');
            new_message.classList.add(msg.from === 'julie' ? 'message_send' : 'message_received');

            let new_p = document.createElement('p');

            if (msg.encrypted) {
                if (msg.from === 'julie') {
                    let information_tom = JSON.parse(localStorage.getItem('information_tom'));
                    decrypted_message = convert_number_to_message(
                        RSA_decryption(BigInt(msg.message), BigInt(information_tom.private_key.d), BigInt(information_tom.private_key.n))
                    );
                    console.log("1");
                } else if (msg.from === 'tom') {
                    let information_julie = JSON.parse(localStorage.getItem('information_julie'));
                    decrypted_message = convert_number_to_message(
                        RSA_decryption(BigInt(msg.message), BigInt(information_julie.private_key.d), BigInt(information_julie.private_key.n))
                    );
                    console.log("2");
                }
            } else {
                decrypted_message = msg.message;
            }
            new_p.textContent = decrypted_message;

            new_message.appendChild(new_p);
            screen.appendChild(new_message);
            screen.scrollTop = screen.scrollHeight;
        }
    }

    function display_message_for_tom(message, chatElement) {
        let screen = chatElement.querySelector('.screen');
        for (let msg of message) {
            let decrypted_message;
            
            let new_message = document.createElement('div');
            new_message.classList.add(msg.from === 'tom' ? 'message_send' : 'message_received');

            let new_p = document.createElement('p');

            if (msg.encrypted) {
                if (msg.from === 'julie') {
                    let information_tom = JSON.parse(localStorage.getItem('information_tom'));
                    decrypted_message = convert_number_to_message(
                        RSA_decryption(BigInt(msg.message), BigInt(information_tom.private_key.d), BigInt(information_tom.private_key.n))
                    );
                    console.log("1");
                } else if (msg.from === 'tom') {
                    let information_julie = JSON.parse(localStorage.getItem('information_julie'));
                    decrypted_message = convert_number_to_message(
                        RSA_decryption(BigInt(msg.message), BigInt(information_julie.private_key.d), BigInt(information_julie.private_key.n))
                    );
                    console.log("2");
                }
            } else {
                decrypted_message = msg.message;
            }
            new_p.textContent = decrypted_message;

            new_message.appendChild(new_p);
            screen.appendChild(new_message);
            screen.scrollTop = screen.scrollHeight;
        }
    }

    if (discusion_julie_tom.length > 0) display_message_for_tom(discusion_julie_tom, chat_2_element);
    if (discusion_julie_tom.length > 0) display_message_for_julie(discusion_julie_tom, chat_1_element);
})

function send_by_julie() {
    let message = document.getElementById('message_write_1').value;
    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];
    let information_tom = JSON.parse(localStorage.getItem('information_tom'));

    if (!information_tom || !information_tom.public_key) return alert("Missing public key");

    let { e, n } = information_tom.public_key;
    let eBig = BigInt(e);
    let nBig = BigInt(n);

    let message_to_number = convert_message_to_number(message);
    let encrypted_message = RSA_encryption(eBig, message_to_number, nBig);

    console.log("Message to number:", message_to_number.toString());
    console.log("Modulus n:", nBig.toString());

    discusion_julie_tom.push({
        from: 'julie',
        message: encrypted_message.toString(),
        encrypted: true,
        timestamp: Date.now()
    });

    localStorage.setItem('discussion_julie_tom', JSON.stringify(discusion_julie_tom));
    document.getElementById('message_write_1').value = '';
}

function send_by_tom() {
    let message = document.getElementById('message_write_2').value;
    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];
    let information_julie = JSON.parse(localStorage.getItem('information_julie'));

    if (!information_julie || !information_julie.public_key) return alert("Missing public key");

    let { e, n } = information_julie.public_key;
    let eBig = BigInt(e);
    let nBig = BigInt(n);

    let message_to_number = convert_message_to_number(message);
    let encrypted_message = RSA_encryption(eBig, message_to_number, nBig);

    discusion_julie_tom.push({
        from: 'tom',
        message: encrypted_message.toString(),
        encrypted: true,
        timestamp: Date.now()
    });

    localStorage.setItem('discussion_julie_tom', JSON.stringify(discusion_julie_tom));
    document.getElementById('message_write_2').value = '';
}

function is_prime(n) {
    if (n <= 1n) return false;
    for (let i = 2n; i * i <= n; i++) {
        if (n % i === 0n) return false;
    }
    return true;
}

function choose_prime_number() {
    let p, q;
    do {
        p = BigInt(Math.floor(Math.random() * 100000000000000) + 100000000000000);
    } while (!is_prime(p));
    do {
        q = BigInt(Math.floor(Math.random() * 100000000000000) + 100000000000000);
    } while (!is_prime(q) || q === p);
    return [p, q];
}

function calculate_n(p, q) {
    return p * q;
}

function var_phi(p, q) {
    return (p - 1n) * (q - 1n);
}

function GCD(a, b) {
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function define_e(phi_n) {
    let e = 65537n;
    if (GCD(e, phi_n) === 1n) {
        return e;
    } else {
        while (true) {
            e = BigInt(Math.floor(Math.random() * Number(phi_n - 2n)) + 2);
            if (GCD(e, phi_n) === 1n) break;
        }
        return e;
    }
}

function extended_gcd(a, b) {
    if (b === 0n) {
        return { gcd: a, x: 1n, y: 0n };
    } else {
        let { gcd, x, y } = extended_gcd(b, a % b);
        return { gcd, x: y, y: x - (a / b) * y };
    }
}

function mod_inverse(e, phi_n) {
    let { gcd, x } = extended_gcd(e, phi_n);
    if (gcd !== 1n) {
        throw new Error('Modular inverse does not exist');
    } else {
        return (x % phi_n + phi_n) % phi_n;
    }
}

function convert_message_to_number(message) {
    let binary = '';
    for (let i = 0; i < message.length; i++) {
        binary += message.charCodeAt(i).toString(2).padStart(8, '0');
    }
    return BigInt('0b' + binary);
}

function convert_number_to_message(number) {
    let binary = number.toString(2);
    binary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
    let message = '';
    for (let i = 0; i < binary.length; i += 8) {
        let byte = binary.slice(i, i + 8);
        message += String.fromCharCode(parseInt(byte, 2));
    }
    return message;
}


function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) result = (result * base) % modulus;
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}

function RSA_encryption(e, m, n) {
    return modPow(m, e, n);
}

function RSA_decryption(encrypted_message, d, n) {
    return modPow(encrypted_message, d, n);
}