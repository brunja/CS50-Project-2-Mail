document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Sending an email on submit
  document.querySelector('form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(event) {

  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent');
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(email => build_emails(email, mailbox))
    // ... do something else with emails ...
  });
}

function build_emails(email, mailbox){
  const item = document.createElement('tr');

  const recipient = document.createElement('th');
  recipient.innerHTML = email.recipients[0];
  recipient.style.width = "20%";
  item.appendChild(recipient);

  const subject = document.createElement('th');
  subject.innerHTML = email.subject;
  subject.style.width = "30%";
  item.appendChild(subject);

  const timestamp = document.createElement('th');
  timestamp.innerHTML = email.timestamp;
  timestamp.className = "col-md-4";
  item.appendChild(timestamp);

  const itemCard = document.createElement('table');
  itemCard.className = 'table';
  itemCard.style.marginBottom = '0.1rem';
  itemCard.appendChild(item);

  document.querySelector('#emails-view').appendChild(itemCard);

  recipient.addEventListener("click", () => show_email(email.id, mailbox));
  subject.addEventListener("click", () => show_email(email.id, mailbox));
  timestamp.addEventListener("click", () => show_email(email.id, mailbox));

  if (email.read == true){
    itemCard.style.backgroundColor = 'lightgrey';
  } else {
    itemCard.style.backgroundColor = 'white';
  }
  
  if (mailbox !== 'sent'){
    const archiveButton = document.createElement('th');
    archiveButton.innerHTML = '<i class="fas fa-archive"></i>';
    item.appendChild(archiveButton);
    archiveButton.addEventListener("click", () => archive_email(email.id, email.archived));
  }
}

function show_email(id, mailbox){

  const email_view = document.querySelector('#emails-view');
  email_view.innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // creating elements with email data
    const data = document.createElement('div');
    data.classList.add('container');

    const subject = document.createElement('h2');
    subject.innerHTML = email.subject;

    const sender = document.createElement('h5');
    sender.innerHTML = email.sender;

    const recipients = document.createElement('h5');
    recipients.innerHTML = email.recipients;

    const body = document.createElement('p');
    body.innerHTML = email.body;

    const time = document.createElement('p');
    time.innerHTML = email.timestamp;

    data.appendChild(subject);
    data.appendChild(sender);
    data.appendChild(recipients);
    data.appendChild(time);

    email_view.appendChild(data);
    email_view.appendChild(body);
    // ... do something else with email ...

    // marking the email as read
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  });
}

// adding toggle for email archive
function archive_email(id, oldValue) {

  const archive = !oldValue;

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archive
    })
  })
  load_mailbox('inbox');
  window.location.reload();
}