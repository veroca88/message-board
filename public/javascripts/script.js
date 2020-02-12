const bodyTag = document.getElementsByTagName("body")[0].attributes[0].value;

document.addEventListener(
    "DOMContentLoaded",
    event => {
        console.log("IronGenerator JS imported successfully!");

        setInterval(
            () => {
                checkMessageUpdates();
            },
            bodyTag === "messageBoardDetails" ? 3000 : 0
        );
    },

    false
);

const checkMessageUpdates = () => {
    // If reply is typed no update happens
    const replyTyped = [...document.getElementsByName("reply")].every(
        reply => reply.value === ""
    );

    // If we are in the messageBoard and there is no reply typing we will get any new messages with AJAX/Axios
    if (bodyTag === "messageBoardDetails" && replyTyped) {
        const location = window.location;

        // Axios get call is made to get any update for the board we are on
        axios
            .get(`${location.origin}${location.pathname}/refresh`)
            .then(boardInfo => {
                appendInfoToBoardPage(boardInfo);
            })
            .catch(error =>
                console.log("error retrieving messages", { error })
            );
    }
};

const appendInfoToBoardPage = boardInfoData => {
    // Get all the messages in reversed order and select dom element on which to display the messages
    const reversedMessages = boardInfoData.data.messages.reverse();
    const divOfMessages = document.getElementById("boardMessages");

    divOfMessages.innerHTML = "";

    // if there are no messages to display inform the user
    if (reversedMessages.length === 0) {
        const newDiv = document.createElement("div");
        newDiv.innerHTML = `
      <div>
        <h3>There are currently no messages to display</h3>
      </div>
      `;
        divOfMessages.appendChild(newDiv);
        return;
    }

    // for each of the messages we create a div with user which created it, message content, delete button, and any reply message we find
    reversedMessages.forEach((message, index) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = "messages__message-div";

        messageDiv.innerHTML = `
      <h4><a href="/users/profile/${message.author._id}">${
            message.author.username
        }</a></h4>
      <div>
        <h3>${message.message}</h3>
      </div>

      <form action="/messages/delete/${message._id}/${
            boardInfoData.data._id
        }" method="POST"><button>X</button></form>

      <hr class="messages__hr">
      <div>

        <h4>${message.replies.length > 0 ? message.replies[0].reply : ""}</h4>

        <a href="/messages/details/${message._id}">${
            message.replies.length
        } Replies</a>

        <form action="/replies/create/${message._id}">
          <label for="replyInput${index + 1}"> Reply </label>
          <input id="replyInput${index + 1}" type="text" name="reply">

          <button onclick="createReply(event)"> Send Reply </button>
        </form>
      </div>
      `;

        divOfMessages.appendChild(messageDiv);
    });
};

// Note that here Async - Await is being used - this is alternative to the promises and is newer ES syntax
const createMessage = async event => {
    // prevent default behaviour(reload) of the page when a function is called
    event.preventDefault();

    // when using async-await we need to surround asynchronous code with try and catch blocks in order to handle any errors
    try {
        let messageInput = event.target.form.elements[0];
        const boardId = getIdFromEvent(event);

        // await signifies that we will be waiting for the axios code to finish before continuing with code execution
        const messageCreation = await axios.post(
            `${window.location.origin}/messages/create/${boardId}`,
            { message: messageInput.value }
        );

        // once the message is created, we will then make another axios call to the board route in order to add the newly created message to the board that it belongs to.
        await axios.get(
            `${window.location.origin}/boards/add-message/${boardId}/${messageCreation.data.newlyCreatedMessage._id}`
        );

        // here we clear out the message input tag after we finish processing the axios calls in order to save the new message to the DB.
        messageInput.value = "";
    } catch (error) {
        console.log("Error Creating Message: ", { error });
    }
};

// new reply creation
const createReply = async event => {
    event.preventDefault();
    try {
        // get the text message of the reply
        let replyInput = event.target.form.elements[0];

        // get the id to which the reply relates to
        const messageId = getIdFromEvent(event);

        // make a new post request to the backend in order to store new reply message into the database
        const creatingReply = await axios.post(
            `${window.location.origin}/replies/create/${messageId}`,
            { reply: replyInput.value }
        );

        // after the user replies to a message we will clear out the reply input field.
        replyInput.value = "";
    } catch (error) {
        console.log("Error creating reply ", { error });
    }
};

// this returns the id of the message or board that the event is relating to
const getIdFromEvent = event => {
    // match returns an array from a string of all the elements that match regex that we pass in as argument
    return event.target.form.action.match(/https?.*\/(.*)\??/)[1];
};
