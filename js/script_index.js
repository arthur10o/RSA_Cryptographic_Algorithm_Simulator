const length_salt = 256

addEventListener('load', function () {
    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];

    let chat_1_element = document.getElementById('chat_1');
    let chat_2_element = document.getElementById('chat_2');
    let chat_hack_element = document.getElementById('chat_hack');

    let information_julie = JSON.parse(localStorage.getItem('information_julie'));
    let information_tom = JSON.parse(localStorage.getItem('information_tom'));
    let information_hacker = JSON.parse(localStorage.getItem('information_hacker'));

    if (!information_julie) generate_user_keys('information_julie');
    if (!information_tom) generate_user_keys('information_tom');
    if (!information_hacker) generate_user_keys('information_hacker');

    if (discusion_julie_tom.length > 0) display_message(discusion_julie_tom, chat_2_element, 'tom');
    if (discusion_julie_tom.length > 0) display_message(discusion_julie_tom, chat_1_element, 'julie');
    if (discusion_julie_tom.length > 0) display_message(discusion_julie_tom, chat_hack_element, 'hacker');

    let switchInput = document.getElementById('monSwitch');
    let state_button = localStorage.getItem('mode_button') || 'off';

    let state_button_hack = localStorage.getItem('hack_state') || 'off';

    if(state_button_hack == 'off') {
        localStorage.setItem('hack_state', 'off');
    }

    if (state_button === 'on') {
        switchInput.checked = true;
    } else {
        switchInput.checked = false;
        localStorage.setItem('mode_button', 'off')
    }

    toogle_button();
})

document.getElementById('monSwitch').addEventListener('change', function () {
    if (this.checked) {
        localStorage.setItem('mode_button', 'on');
    } else {
        localStorage.setItem('mode_button', 'off');
    }

    toogle_button();
});

document.getElementById('hack_activate').addEventListener('change', function () {
    if (this.checked) {
        localStorage.setItem('hack_state', 'on');
    } else {
        localStorage.setItem('hack_state', 'off');
    }

    toogle_button();
});

document.addEventListener('keydown', function() {
    if(event.key == 'Enter') {
        const actif = document.activeElement;
        if(actif.tagName == 'TEXTAREA') {
            if(actif.id == 'message_write_1') {
                send_message(actif.id, 'julie');
            } else if(actif.id == 'message_write_2') {
                send_message(actif.id, 'tom');
            }
        }
    }
});

function toogle_button() {
    let state_button = localStorage.getItem('mode_button') || 'off';
    let background_element = document.getElementsByClassName('background_element');

    for (let elem of background_element) {
        if (state_button == 'on') {
            elem.style.backgroundColor  = 'green';
        } else if (state_button == 'off') {
            elem.style.backgroundColor  = 'darkred';
        }
    }
}

function generate_user_keys(storageKey) {
    let [p, q] = choose_prime_number();
    let n = calculate_n(p, q);
    let phi_n = var_phi(p, q);
    let e = define_e(phi_n);
    let d = mod_inverse(e, phi_n);

    let user_information = {
        public_key: { e: e.toString(), n: n.toString() },
        private_key: { d: d.toString(), n: n.toString() }
    }

    localStorage.setItem(storageKey, JSON.stringify(user_information));
}

function choose_prime_number() {
    let p, q;

    do {
        p = randomBigIntBits(48);
    } while (!is_prime(p));
    do {
        q = randomBigIntBits(48);
    } while (!is_prime(q) || q === p);
    return [p, q];
}

function randomBigIntBits(bits) {
    let max = (1n << BigInt(bits)) - 1n;
    let min = (1n << (BigInt(bits) - 1n));

    return min + BigInt(Math.floor(Math.random() * Number(max - min)));
}

function is_prime(n) {
    if (n <= 1n) return false;

    for (let i = 2n; i * i <= n; i++) {
        if (n % i === 0n) return false;
    }

    return true;
}

function calculate_n(p, q) {
    return p * q;
}

function var_phi(p, q) {
    return (p - 1n) * (q - 1n);
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

function GCD(a, b) {
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
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

function modPow(base, exponent, modulus) {
    base = BigInt(base);
    exponent = BigInt(exponent);
    modulus = BigInt(modulus);

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

function convert_message_to_number(message) {
    let hex = '';

    for (let i = 0; i < message.length; i++) {
        hex += message.charCodeAt(i).toString(16).padStart(2, '0');
    }

    return BigInt('0x' + hex);
}

function RSA_encryption(e, m, n) {
    return modPow(m, e, n);
}

function convert_number_to_message(number) {
    let hex = number.toString(16);

    if (hex.length % 2 !== 0) hex = '0' + hex;

    let message = '';

    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.slice(i, i + 2), 16);
        if (byte >= 32 && byte <= 126) {
            message += String.fromCharCode(byte);
        } else {
            message += String.fromCharCode(byte);
        }
    }
    
    return message;
}

function RSA_decryption(encrypted_message, d, n) {
    return modPow(encrypted_message, d, n);
}

function count_max_size_package(n) {
    const buffer = 10n;

    let maxLen = 1;

    while (true) {
        let testStr = 'A'.repeat(maxLen);
        let testBigInt = convert_message_to_number(testStr);

        if (testBigInt >= (n - buffer)) {
            return maxLen - 1;
        }

        maxLen++;
    }
}

function rsa_safe_block_split(message, nBig) {
    const buffer = 10n;
    
    let max_size = count_max_size_package(nBig);
    let blocks = [];
    let current = '';

    for (let char of message) {
        current += char;
        let numeric = convert_message_to_number(current);
        if (numeric >= nBig - buffer) {
            current = current.slice(0, -1);
            if (current.length > 0) {
                blocks.push(current);
            }
            current = char;
        }
    }

    if (current.length > 0) {
        blocks.push(current);
    }
    return blocks;
}

async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function rsa_signature(message, d, n) {
    if (typeof message !== 'string') {
        throw new Error("Le message doit être une chaîne de caractères");
    }
    let message_hash = await sha256(message);
    let message_number = convert_message_to_number(message_hash);
    return RSA_encryption(d, message_number, n).toString();
}

async function rsa_signature_verification(message_decrypted, signature_encrypted, n, d) {
    let new_signature = await rsa_signature(message_decrypted, d, n);
    return signature_encrypted == new_signature;
}

function generate_salt(lenght) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&~"#{}()[]-|`_^@=°+-*/£¤$%§!/:.;?,<>²çâêûîôìùòñùµéèà';
    let result = '';
    for(let i = 0; i < lenght; i++) {
        const random_index = Math.floor(Math.random() * chars.length);
        result += chars[random_index];
    }
    return result;
}

function remove_salt(message_salt) {
    return message_salt.split("::")[1] || '';
}

function decrypted_block(d, n, message) {
    let blocks = message;
    return blocks.map(part => {
        let decrypted_number = RSA_decryption(BigInt(part), d, n);
        return convert_number_to_message(decrypted_number);
    });
}

async function display_message(message, chatElement, from) {
    let screen = chatElement.querySelector('.screen');
    let information_tom = JSON.parse(localStorage.getItem('information_tom'));
    let information_julie = JSON.parse(localStorage.getItem('information_julie'));
    let information_hacker = JSON.parse(localStorage.getItem('information_hacker'));

    if (!information_tom || !information_tom.private_key) return alert('Missing private key');
    if (!information_julie || !information_julie.private_key) return alert('Missing private key');
    if (!information_hacker || !information_hacker.private_key) return alert('Missing private key');
    if (!information_julie || !information_julie.public_key) return alert('Missing public key');
    if (!information_tom || !information_tom.public_key) return alert('Missing public key');
    if (!information_hacker || !information_hacker.public_key) return alert('Missing public key');

    let d_tom = BigInt(information_tom.private_key.d);
    let n_tom = BigInt(information_tom.private_key.n);
    let e_tom = BigInt(information_tom.public_key.e);

    let d_julie = BigInt(information_julie.private_key.d);
    let n_julie = BigInt(information_julie.private_key.n);
    let e_julie = BigInt(information_julie.public_key.e);

    let d_hacker = BigInt(information_hacker.private_key.d);
    let n_hacker = BigInt(information_hacker.private_key.n);
    let e_hacker = BigInt(information_hacker.public_key.e);

    for (let msg of message) {
        let decrypted_message;

        let new_message = document.createElement('div');
        new_message.classList.add(msg.from === from ? 'message_send' : 'message_received');

        let new_p = document.createElement('p');

        if (msg.from == from) {
            if(from == 'tom') {
                decrypted_message = msg.encrypted && msg.message_for_sender
                    ? remove_salt(decrypted_block(d_tom, n_tom, msg.message_for_sender).join(''))
                    : msg.message;
            } else if (from == 'julie') {
                decrypted_message = msg.encrypted && msg.message_for_sender
                    ? remove_salt(decrypted_block(d_julie, n_julie, msg.message_for_sender).join(''))
                    : msg.message;
            } else if (from == 'hacker') {
                decrypted_message = msg.encrypted && msg.message_for_sender
                    ? remove_salt(decrypted_block(d_hacker, n_hacker, msg.message_for_sender).join(''))
                    : msg.message;
            }
        } else if(msg.encrypted) {
            let decrypted_blocks;

            if(Array.isArray(msg.message)) {
                if(from == 'tom') {
                    decrypted_blocks = decrypted_block(d_tom, n_tom, msg.message);
                } else if(from == 'julie') {
                    decrypted_blocks = decrypted_block(d_julie, n_julie, msg.message);
                } else if(from == 'hacker') {
                    decrypted_blocks = decrypted_block(d_hacker, n_hacker, msg.message);
                }
                decrypted_message = decrypted_blocks.join('');
                decrypted_message = remove_salt(decrypted_message);
            } else {
                let decrypted_number;
                if(msg.message == undefined) {
                    decrypted_message = '[Message error: message not defined]';
                } else {
                    try {
                        if(from == 'tom') {
                            decrypted_number = RSA_decryption(BigInt(msg.message), d_tom, n_tom);
                        } else if(from == 'julie') {
                            decrypted_number = RSA_decryption(BigInt(msg.message), d_julie, n_julie);
                        } else if(from == 'hacker') {
                            decrypted_number = RSA_decryption(BigInt(msg.message), d_hacker, n_hacker);
                        }
                        decrypted_message = convert_number_to_message(decrypted_number);
                    } catch(e) {
                        decrypted_message = "[Decryption error]";
                        console.error("Erreur RSA_decryption :", e);
                    }
                }
            }

            let is_valid;

            if(msg.from == 'julie') {
                is_valid = await rsa_signature_verification(decrypted_message, msg.signature, n_julie, d_julie);
            } else if(msg.from == 'tom') {
                is_valid = await rsa_signature_verification(decrypted_message, msg.signature, n_tom, d_tom);
            } 
            
            if (is_valid) {
                decrypted_message += '\n✅ (Signature verified)';
            } else {
                decrypted_message += '\n⚠️ (invalid signature)';
            }
        } else {
            decrypted_message = msg.message;
            decrypted_message += '\n⚠️ (unencrypted message)';
        }

        new_p.textContent = decrypted_message;
        new_message.appendChild(new_p);
        screen.appendChild(new_message);
        screen.scrollTop = screen.scrollHeight;
    }
}

function refresh_messages() {
    let chat_1_element = document.getElementById('chat_1');
    let chat_2_element = document.getElementById('chat_2');
    let chat_hack_element = document.getElementById('chat_hack');

    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];

    if (discusion_julie_tom.length === 0) return;

    let lastMessage = discusion_julie_tom[discusion_julie_tom.length - 1];

    display_message([lastMessage], chat_2_element, 'tom');
    display_message([lastMessage], chat_1_element, 'julie');
    display_message([lastMessage], chat_hack_element, 'hacker');
}

function message_to_send(from, message, encrypted_state, signature = '', message_for_sender) {
    return {
        from: from,
        message: message,
        message_for_sender: message_for_sender,
        encrypted: encrypted_state,
        timestamp: Date.now(),
        signature: signature
    };
}

async function send_message(message_elem, from) {
    let message = document.getElementById(message_elem).value;

    if(message == '') {
        return;
    }

    let discusion_julie_tom = JSON.parse(localStorage.getItem('discussion_julie_tom')) || [];
    let information_tom = JSON.parse(localStorage.getItem('information_tom'));
    let information_julie = JSON.parse(localStorage.getItem('information_julie'));
    let information_hacker = JSON.parse(localStorage.getItem('information_hacker'));

    let state_button = localStorage.getItem('mode_button') || 'off';
    let state_button_hack = localStorage.getItem('hack_state') || 'off';

    if (!information_tom || !information_tom.private_key) return alert('Missing private key');
    if (!information_julie || !information_julie.private_key) return alert('Missing private key');
    if (!information_hacker || !information_hacker.private_key) return alert('Missing private key');
    if (!information_julie || !information_julie.public_key) return alert('Missing public key');
    if (!information_tom || !information_tom.public_key) return alert('Missing public key');
    if (!information_hacker || !information_hacker.public_key) return alert('Missing public key');

    let d_tom = BigInt(information_tom.private_key.d);
    let n_tom = BigInt(information_tom.private_key.n);
    let e_tom = BigInt(information_tom.public_key.e);

    let d_julie = BigInt(information_julie.private_key.d);
    let n_julie = BigInt(information_julie.private_key.n);
    let e_julie = BigInt(information_julie.public_key.e);

    let d_hacker = BigInt(information_hacker.private_key.d);
    let n_hacker = BigInt(information_hacker.private_key.n);
    let e_hacker = BigInt(information_hacker.public_key.e);

    if (state_button == 'off') {
        discusion_julie_tom.push(message_to_send(from, message, false));
    } else {
        let salt = generate_salt(length_salt);
        let message_salt = `${salt}::${message}`;

        let encrypted_blocks;
        let message_for_sender;
        let signature;

        if(from == 'julie') {
            let messages_blocks = rsa_safe_block_split(message_salt, n_tom);
            encrypted_blocks = messages_blocks.map(block => {
                let message_to_number = convert_message_to_number(block);
                if (message_to_number >= n_tom) {
                    throw new Error('Message block too large for encryption modulus');
                }
                return RSA_encryption(e_tom, message_to_number, n_tom).toString();
            });

            messages_blocks = rsa_safe_block_split(message_salt, n_julie);
            message_for_sender = messages_blocks.map(block => {
                let message_to_number = convert_message_to_number(block);
                if (message_to_number >= n_julie) {
                    throw new Error('Message block too large for encryption modulus');
                }
                return RSA_encryption(e_julie, message_to_number, n_julie).toString();
            });

            signature = await rsa_signature(message, d_julie, n_julie);

        } else if(from == 'tom'){
            let messages_blocks = rsa_safe_block_split(message_salt, n_julie);
            encrypted_blocks = messages_blocks.map(block => {
                let message_to_number = convert_message_to_number(block);
                if (message_to_number >= n_julie) {
                    throw new Error('Message block too large for encryption modulus');
                }
                return RSA_encryption(e_julie, message_to_number, n_julie).toString();
            });

            messages_blocks = rsa_safe_block_split(message_salt, n_tom);
            message_for_sender = messages_blocks.map(block => {
                let message_to_number = convert_message_to_number(block);
                if (message_to_number >= n_tom) {
                    throw new Error('Message block too large for encryption modulus');
                }
                return RSA_encryption(e_tom, message_to_number, n_tom).toString();
            });

            signature = await rsa_signature(message, d_tom, n_tom);
        }
        discusion_julie_tom.push(message_to_send(from, encrypted_blocks, true, signature, message_for_sender));
    }

    localStorage.setItem('discussion_julie_tom', JSON.stringify(discusion_julie_tom));
    document.getElementById(message_elem).value = '';

    refresh_messages();
}