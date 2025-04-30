function generate_RSA_keys() {
    let [p, q] = choose_prime_number();
    let n = calculate_n(p, q);
    let phi_n = var_phi(p, q);
    let e = define_e(phi_n);
    let d = mod_inverse(e, phi_n);
    let public_key = { e, n };
    let private_key = { d, n };

    let input = document.getElementById('masterPassword_login').value;
    let m = convert_message_to_number(input);

    let encrypted_message = RSA_encryption(e, m, n);
    let decrypted_message = RSA_decryption(encrypted_message, d, n);
    let recovered_message = convert_number_to_message(decrypted_message);

    console.log("Original message:", input);
    console.log("Encrypted:", encrypted_message.toString());
    console.log("Decrypted:", decrypted_message.toString());
    console.log("Recovered message:", recovered_message);
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
