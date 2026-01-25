// ============================================
// FIREBASE LOGIN SISTĒMA (UPDATED)
// ============================================
// Lietotājs pats izdomā paroli reģistrējoties
// Admin tikai apstiprina piekļuvi

let currentUser = null;

// ============================================
// "ATCERIES MANI" FUNKCIONALITĀTE
// ============================================
function saveRememberMe(email) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('rememberedEmail', email);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    localStorage.setItem('rememberExpiry', expiry.toISOString());
}

function clearRememberMe() {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberExpiry');
}

function checkRememberMe() {
    const rememberMe = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const expiry = localStorage.getItem('rememberExpiry');
    
    if (rememberMe && rememberedEmail && expiry) {
        const expiryDate = new Date(expiry);
        if (new Date() < expiryDate) {
            document.getElementById('loginUser').value = rememberedEmail;
            document.getElementById('remember').checked = true;
        } else {
            clearRememberMe();
        }
    }
}

// ============================================
// LAPU PĀRSLĒGŠANA
// ============================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// ============================================
// PĀRBAUDE VAI LIETOTĀJS IR ADMIN
// ============================================
async function checkIfAdmin(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Kļūda pārbaudot admin statusu:', error);
        return false;
    }
}

// ============================================
// LOGIN FORMA
// ============================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const emailOrName = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const remember = document.getElementById('remember').checked;
    
    try {
        // Pārbaude vai ievadīts e-pasts vai vārds
        let email = emailOrName;
        
        // Ja nav @ simbola, meklē e-pastu pēc vārda Firestore
        if (!emailOrName.includes('@')) {
            const usersSnapshot = await db.collection('users')
                .where('name', '==', emailOrName)
                .limit(1)
                .get();
            
            if (usersSnapshot.empty) {
                alert('Lietotājs nav atrasts!');
                return;
            }
            
            email = usersSnapshot.docs[0].data().email;
        }
        
        // Ielogojamies ar Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Iegūstam lietotāja datus no Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            alert('Lietotāja dati nav atrasti sistēmā!');
            await auth.signOut();
            return;
        }
        
        const userData = userDoc.data();
        
        // Pārbaudām vai lietotājs ir apstiprināts
        if (!userData.approved) {
            alert('Jūsu konts vēl nav apstiprināts. Lūdzu, gaidiet administratora apstiprinājumu.');
            await auth.signOut();
            return;
        }
        
        // Atceries mani funkcionalitāte
        if (remember) {
            saveRememberMe(email);
        } else {
            clearRememberMe();
        }
        
        // Pārvirza atkarībā no lomas
        if (userData.role === 'admin') {
            window.location.href = 'firebase-admin.html';
        } else {
            window.location.href = 'music-index-youtube.html';
        }
        
    } catch (error) {
        console.error('Login kļūda:', error);
        
        if (error.code === 'auth/user-not-found') {
            alert('Lietotājs nav atrasts!');
        } else if (error.code === 'auth/wrong-password') {
            alert('Nepareiza parole!');
        } else if (error.code === 'auth/invalid-email') {
            alert('Nepareizs e-pasta formāts!');
        } else {
            alert('Kļūda ielogojoties: ' + error.message);
        }
    }
});

// ============================================
// GOOGLE SIGN-IN
// ============================================
document.getElementById('googleSignInBtn').addEventListener('click', async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Pārbaudām vai lietotājs jau ir sistēmā
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            if (userData.approved) {
                // Jau apstiprināts - iet uz music-index
                window.location.href = 'music-index.html';
            } else {
                // Gaida apstiprinājumu
                alert('Jūsu konts gaida administratora apstiprinājumu.');
                await auth.signOut();
            }
        } else {
            // Jauns lietotājs - pievienojam pending
            const pendingCheck = await db.collection('pending_users')
                .where('email', '==', user.email)
                .get();
            
            if (!pendingCheck.empty) {
                alert('Jūsu pieteikums jau ir iesniegts un gaida apstiprinājumu.');
                await auth.signOut();
                return;
            }
            
            await db.collection('pending_users').add({
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                authProvider: 'google',
                googleUID: user.uid,
                photoURL: user.photoURL || null,
                approved: false,
                createdAt: timestamp()
            });
            
            console.log('✅ Google lietotājs pievienots pending_users');
            alert('Paldies! Jūsu pieteikums ir nosūtīts administratoram. Jūs saņemsiet apstiprinājumu pēc pieteikuma apstiprināšanas.');
            await auth.signOut();
            showPage('registerSuccessPage');
        }
        
    } catch (error) {
        console.error('Google Sign-In kļūda:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            // Lietotājs aizvēra popup - nav jārāda kļūda
            return;
        }
        alert('Kļūda ar Google ielogošanos: ' + error.message);
    }
});

// ============================================
// REĢISTRĀCIJAS FORMA (Email/Password)
// ============================================
// JAUNA LOĢIKA: Lietotājs pats izdomā paroli!
// Admin tikai apstiprina kontu, bet neizdomā paroli
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Paroles validācija
    if (password !== passwordConfirm) {
        alert('Paroles nesakrīt! Lūdzu pārbaudiet un mēģiniet vēlreiz.');
        return;
    }
    
    if (password.length < 6) {
        alert('Parole ir pārāk īsa! Minimums 6 simboli.');
        return;
    }
    
    // 🤣 JOKU LAUKU BRĪDINĀJUMS
    const personCode = document.getElementById('regPersonCode').value;
    const cardNumber = document.getElementById('regCardNumber').value;
    const cvv = document.getElementById('regCVV').value;
    
    if (personCode || cardNumber || cvv) {
        console.log('🤣🤣🤣 BRĪDINĀJUMS! 🤣🤣🤣');
        console.log('Tu ievadīji datus "joku laukos"!');
        console.log('NEKAD nedod šādus datus nezināmām vietnēm!');
        console.log('Šie lauki ir tikai izglītojošs piemērs.');
        console.log('Mēs šos datus NEIGLABĀJAM un NEIZMANTOJAM!');
        
        alert('🤣 STOP! 🤣\n\nTu ievadīji datus "joku laukos"!\n\nŠie lauki ir tikai IZGLĪTOJOŠS piemērs.\nNEKAD nedod personas kodu, kartes datus vai naudu internetā!\n\nTava reģistrācija tiks apstrādāta tikai ar vārdu un e-pastu.');
    }
    
    try {
        // Pārbaude vai vārds jau eksistē
        const nameCheck = await db.collection('users')
            .where('name', '==', name)
            .get();
        
        const pendingNameCheck = await db.collection('pending_users')
            .where('name', '==', name)
            .get();
        
        if (!nameCheck.empty || !pendingNameCheck.empty) {
            alert('Lietotājs ar šo vārdu jau eksistē!');
            return;
        }
        
        // Pārbaude vai e-pasts jau eksistē
        const emailCheck = await db.collection('users')
            .where('email', '==', email)
            .get();
        
        const pendingEmailCheck = await db.collection('pending_users')
            .where('email', '==', email)
            .get();
        
        if (!emailCheck.empty || !pendingEmailCheck.empty) {
            alert('Lietotājs ar šo e-pastu jau ir reģistrēts!');
            return;
        }
        
        // ⭐ JAUNA LOĢIKA: Saglabājam lietotāju ar disabled statusu
        // Izveidojam Firebase Authentication kontu, bet ar disabled custom claim
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;
        
        // Pievienojam lietotāju ar pending statusu
        await db.collection('pending_users').doc(newUser.uid).set({
            name: name,
            email: email,
            authProvider: 'email',
            approved: false,
            disabled: true, // Konts ir disabled līdz admin apstiprina
            createdAt: timestamp()
        });
        
        // Uzreiz izlogojas, jo konts nav apstiprināts
        await auth.signOut();
        
        console.log('✅ Reģistrācijas pieprasījums nosūtīts!');
        alert('Paldies par reģistrāciju! Jūsu konts ir izveidots, bet gaida administratora apstiprinājumu. Jūs saņemsiet paziņojumu, kad varēsiet ielogoties.');
        showPage('registerSuccessPage');
        
    } catch (error) {
        console.error('Reģistrācijas kļūda:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            alert('Šis e-pasts jau tiek izmantots!');
        } else if (error.code === 'auth/invalid-email') {
            alert('Nepareizs e-pasta formāts!');
        } else if (error.code === 'auth/weak-password') {
            alert('Parole ir pārāk vāja! Izmantojiet vismaz 6 simbolus.');
        } else {
            alert('Kļūda reģistrējoties: ' + error.message);
        }
    }
});

// ============================================
// AIZMIRSU PAROLI FORMA
// ============================================
document.getElementById('forgotForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Paroles atjaunošanas e-pasts nosūtīts uz ' + email);
        showPage('forgotSuccessPage');
    } catch (error) {
        console.error('Password reset kļūda:', error);
        
        if (error.code === 'auth/user-not-found') {
            alert('Lietotājs ar šo e-pastu nav atrasts!');
        } else if (error.code === 'auth/invalid-email') {
            alert('Nepareizs e-pasta formāts!');
        } else {
            alert('Kļūda: ' + error.message);
        }
    }
});

// ============================================
// AUTHENTICATION STATE LISTENER
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('Lietotājs ielogojies:', user.email);
    } else {
        currentUser = null;
        console.log('Lietotājs nav ielogojies');
    }
});

// ============================================
// INICIALIZĀCIJA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkRememberMe();
    console.log('✅ Firebase login sistēma inicializēta!');
});
