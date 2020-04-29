const sgmail = require('@sendgrid/mail');

sgmail.setApiKey(process.env.SENDGRID_KEY);


// send is an async function, but there's no need to wait for the e-mail to be sent
const sendWelcomeEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: 'Welcome to Task App!',
        text: `Hi, ${name}. Thanks for joining Task App! We're happy to have you here. :)`
    });
}

const sendGoodbyeEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: 'Sad to see you go :(',
        text: `Hi, ${name}. I heard you're leaving Task App. Thanks for being part of it. I hope to see you again.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
};