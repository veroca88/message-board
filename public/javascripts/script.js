const bodyTag = document.getElementsByTagName("body")[0].attributes[0].value;

document.addEventListener(
    "DOMContentLoaded",
    event => {
        console.log("IronGenerator JS imported successfully!");

        setInterval(
            () => {
                checkMessageUpdates();
            },
            bodyTag === "messageBoardDetails" ? 5000 : 0
        );
    },

    false
);

const checkMessageUpdates = () => {
    if (bodyTag === "messageBoardDetails") {
        const location = window.location;
        console.log({ location });
        axios
            .get(`${location.origin}${location.pathname}/refresh`)
            .then(boardInfo => {
                console.log({ boardInfo });
                appendInfoToBoardPage(boardInfo);
            })
            .catch(error =>
                console.log("error retrieving messages", { error })
            );
    }
};

const appendInfoToBoardPage = boardInfoData => {
    console.log({ boardInfoData });
    const reversedMessages = boardInfoData.data.messages.reverse();
    const divOfMessages = document.getElementById("boardMessages");

    divOfMessages.innerHTML = "";

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

    reversedMessages.forEach((message, index) => {
        console.log({ message });
        const messageDiv = document.createElement("div");
        messageDiv.className = "messages__message-div";

        messageDiv.innerHTML = `
      <h4>${message.author.username}</h4>
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

const createMessage = async event => {
    event.preventDefault();
    try {
        console.log({ event });
        let messageInput = event.target.form.elements[0];
        const boardId = getIdFromEvent(event);

        const messageCreation = await axios.post(
            `${window.location.origin}/messages/create/${boardId}`,
            { message: messageInput.value }
        );

        const addMessageToBoard = await axios.get(
            `${window.location.origin}/boards/add-message/${boardId}/${messageCreation.data.newlyCreatedMessage._id}`
        );

        messageInput.value = "";
    } catch (error) {
        console.log("Error Creating Message: ", { error });
    }
};

const createReply = async event => {
    event.preventDefault();
    try {
        let replyInput = event.target.form.elements[0];
        console.log({ replyInput, event });

        const messageId = getIdFromEvent(event);

        const creatingReply = await axios.post(
            `${window.location.origin}/replies/create/${messageId}`,
            { reply: replyInput.value }
        );

        replyInput.value = "";

        console.log({ creatingReply });
    } catch (error) {
        console.log("Error creating reply ", { error });
    }
};

const getIdFromEvent = event => {
    console.log({ formElements: event.target.form.elements[0].value });
    return event.target.form.action.match(/https?.*\/(.*)\??/)[1];
};
