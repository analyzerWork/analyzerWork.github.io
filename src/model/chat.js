async function consumeReadableStream(stream, callback, signal) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  signal.addEventListener("abort", () => reader.cancel(), { once: true });

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        callback(decoder.decode(value, { stream: true }));
      }
    }
  } catch (error) {
    if (signal.aborted) {
      console.error("Stream reading was aborted:", error);
    } else {
      console.error("Error consuming stream:", error);
    }
  } finally {
    reader.releaseLock();
  }
}

class ChatModel {
  constructor(options) {
    this.loading = false;
    this.chatMessages = [];
    this.options = options;
  }
  /**
   * 
   * @param {*} messageContent string
   * @param {*} chatMessages 
   * @param {*} chatSettings 
   * @param {*} isRegeneration 
   * @param {*} setChatMessages 
   * @param {*} selectedAssistant 
   * @returns 
   */
  createTempMessages = (
    messageContent,
    chatMessages,
    isRegeneration,
  ) => {
    let tempUserChatMessage = {
        chat_id: "",
        assistant_id: null,
        content: messageContent,
        created_at: "",
        id: crypto.randomUUID(),
        role: "user",
        sequence_number: chatMessages.length,
        updated_at: "",
        user_id: ""
    }
  
    let tempAssistantChatMessage = {
        chat_id: "",
        assistant_id:  null,
        content: "",
        created_at: "",
        id: crypto.randomUUID(),
        role: "assistant",
        sequence_number: chatMessages.length + 1,
        updated_at: "",
        user_id: ""
    }
  
    let newMessages = []
  
    if (isRegeneration) {
      const lastMessageIndex = chatMessages.length - 1
      chatMessages[lastMessageIndex].message.content = ""
      newMessages = [...chatMessages]
    } else {
      newMessages = [
        ...chatMessages,
        tempUserChatMessage,
        tempAssistantChatMessage
      ]
    }
    
    return {
      tempUserChatMessage,
      tempAssistantChatMessage,
      newMessages
    }
  }

  updateChatMessage(){
    const prev = this.chatMessages;
    this.chatMessages = prev.map(chatMessage => {
        if (chatMessage.message.id === lastChatMessage.message.id) {
          const updatedChatMessage = {
            ...chatMessage.message,
            content: fullText
          }

          return updatedChatMessage
        }

        return chatMessage
      })
  }

  async handleChat(payload){
    const response = await this.fetchChatResponse();

    const tempAssistantChatMessage = {
        chat_id: "",
        assistant_id:  null,
        content: "",
        created_at: "",
        id: crypto.randomUUID(),
        role: "assistant",
        sequence_number: this.chatMessages.length + 1,
        updated_at: "",
        user_id: ""
    }

    return await this.processResponse(response, tempAssistantChatMessage,)

  }


  async fetchChatResponse(content) {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      return response;
    }
  }

  async processResponse(response) {
    let fullText = "";
    let contentToAdd = "";
    if (response.body) {
      await consumeReadableStream(response.body, (chunk) => {
        try {
          contentToAdd = chunk
            .trimEnd()
            .split("\n")
            .reduce((acc, line) => {
                console.log(line)
                return acc + JSON.parse(line).message.content
            }, "");
        fullText += contentToAdd
        console.log(contentToAdd);
        

        } catch (e) {
            console.error("Error parsing :", e)
        }
      });
    }
  }
 
}


