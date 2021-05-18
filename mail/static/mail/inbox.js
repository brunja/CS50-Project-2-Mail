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
  const item = document.createElement('div');
  item.className = "row";

  const recipient = document.createElement('div');
  recipient.innerHTML = email.recipients[0];
  recipient.className = "col-3";
  item.appendChild(recipient);

  const subject = document.createElement('div');
  subject.innerHTML = email.subject;
  subject.className = "col-3";
  item.appendChild(subject);

  const timestamp = document.createElement('div');
  timestamp.innerHTML = email.timestamp;
  timestamp.className = "col-6";
  item.appendChild(timestamp);

  const itemCard = document.createElement('div');
  itemCard.style.marginBottom = '0.1rem';
  itemCard.style.padding = '0.1rem';
  itemCard.style.cursor = 'pointer';
  itemCard.appendChild(item);

  document.querySelector('#emails-view').appendChild(itemCard);

  recipient.addEventListener("click", () => show_email(email.id, mailbox));
  subject.addEventListener("click", () => show_email(email.id, mailbox));
  timestamp.addEventListener("click", () => show_email(email.id, mailbox));

  // marking the email as read and applying the background of div
  if (email.read == true){
    itemCard.style.backgroundColor = 'lightgrey';
  } else {
    itemCard.style.backgroundColor = 'white';
  }

  // adding "archive" button to inbox and "unarchive" to archived email inbox
  if (mailbox !== 'sent'){
    const archiveButton = document.createElement('div');
    archiveButton.innerHTML = '<i class="fas fa-archive"></i>';
    timestamp.className = "col-5";
    archiveButton.className = "col-1";
    item.appendChild(archiveButton);
    archiveButton.addEventListener("click", () => archive_email(email.id, email.archived));
  }
}

function show_email(id){

  const email_view = document.querySelector('#emails-view');
  email_view.innerHTML = "";

  // fetching the appropriate email from api
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // creating elements with email data
    const data = document.createElement('div');
    data.classList.add('container');
    
    // creating a separate div for sender, timestamp and reply button
    const senderDiv = document.createElement('div');
    senderDiv.className = 'row';

    const subject = document.createElement('h3');
    subject.innerHTML = email.subject;

    const sender = document.createElement('div');
    sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
    sender.className = 'col-8';
    senderDiv.appendChild(sender);

    const recipients = document.createElement('div');
    recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`;

    const body = document.createElement('div');
    body.innerHTML = email.body;
    body.style.marginTop = '10px';

    const time = document.createElement('div');
    time.innerHTML = email.timestamp;
    time.className = 'col-3';
    senderDiv.appendChild(time);

    // adding a reply button and pre-populating it existing data
    const replyButton = document.createElement("div");
    replyButton.innerHTML = '<i class="fas fa-reply"></i>';
    replyButton.className = 'col-1';
    senderDiv.appendChild(replyButton);
    replyButton.addEventListener("click", () => {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: ${email.body}`;
    });

    data.appendChild(subject);
    data.appendChild(senderDiv);
    data.appendChild(recipients);
    data.appendChild(body);

    email_view.appendChild(data);

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
function archive_email(id, oldVal) {
  const archived = !oldVal;

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archived
    })
  })
  load_mailbox('inbox');
  window.location.reload();
}