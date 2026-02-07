let wasAtBottom = true;
let lockBottom = true;
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Chat state
let chatHistory = [
	{
		role: "assistant",
		content:
			"Hello?",
	},
];
let isProcessing = false;

// Auto-resize textarea as user types
userInput.addEventListener("input", function () {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
});

// Send message on Enter (without Shift)
userInput.addEventListener("keydown", function (e) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
function forgleAbout(forgleName) {
	var prompt = "Tell me about " + forgleName;
	sendMessage(prompt);
}
async function sendMessage(text=null) {
	var message = userInput.value.trim();
	if(text) {
		message = text;
	}

	// Don't send empty messages
	if (message === "" || isProcessing) return;

	// Disable input while processing
	isProcessing = true;
	userInput.disabled = true;
	sendButton.disabled = true;

	// Add user message to chat
	addMessageToChat("user", message);

	// Clear input
	userInput.value = "";
	userInput.style.height = "auto";

	// Show typing indicator
	typingIndicator.classList.add("visible");

	// Add message to history
	chatHistory.push({ role: "user", content: message });

	try {
		// Create new assistant response element
		var wasAtBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
		const assistantMessageEl = document.createElement("div");
		assistantMessageEl.className = "message assistant-message";
		assistantMessageEl.innerHTML = "<p></p>";
		chatMessages.appendChild(assistantMessageEl);
		const assistantTextEl = assistantMessageEl.querySelector("p");

		// Scroll to bottom
		if(wasAtBottom || lockBottom) {
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}

		// Send request to API
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: chatHistory,
			}),
		});

		// Handle errors
		if (!response.ok) {
			throw new Error("Failed to get response");
		}
		if (!response.body) {
			throw new Error("Response body is null");
		}

		// Process streaming response
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let responseText = "";
		let buffer = "";
		const flushAssistantText = () => {
			var wasAtBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
			assistantTextEl.textContent = responseText;
			if(wasAtBottom || lockBottom) {
				chatMessages.scrollTop = chatMessages.scrollHeight;
			}
		};

		let sawDone = false;
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// Process any remaining complete events in buffer
				const parsed = consumeSseEvents(buffer + "\n\n");
				for (const data of parsed.events) {
					if (data === "[DONE]") {
						break;
					}
					try {
						const jsonData = JSON.parse(data);
						// Handle both Workers AI format (response) and OpenAI format (choices[0].delta.content)
						let content = "";
						if (
							typeof jsonData.response === "string" &&
							jsonData.response.length > 0
						) {
							content = jsonData.response;
						} else if (jsonData.choices?.[0]?.delta?.content) {
							content = jsonData.choices[0].delta.content;
						}
						if (content) {
							responseText += content;
							flushAssistantText();
						}
					} catch (e) {
						console.error("Error parsing SSE data as JSON:", e, data);
					}
				}
				break;
			}

			// Decode chunk
			buffer += decoder.decode(value, { stream: true });
			const parsed = consumeSseEvents(buffer);
			buffer = parsed.buffer;
			var forgleImages = [
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYOn_KkZT_sCEo1ECyqn05QIa59NSziLaSHz2KDAYIi6Q2hyCwi8xCLFW70kuqBXcnFEmcVvgoNbd4rG6CYP--lwZDHB_pHiPsCZnTtzSMjg&s=10", "Tree Frog"]
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZEKI_uyleXWibl99GBNZZqs40qNtvR_Ab4roDI4iBDbaly7h_MHNp0c8ZfMSIv_zmul73gZjWFEIKFmCezfXPfSbLWyubbsbMIAYtwqtkiQ&s=10", "Australian Green Tree Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_o2I56FvpW_fMO5HiPdwYxgbCSDvo1heVFSgeGzTpJBYJWTVamnjK8eZIkNRL3p0e-0sN4VYHSwE0jnhtZvvHhdnjd6HUOZocjtwMUUvwvw&s=10", "Foothill Yellow-Legged Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV_WG-B2VirQhtzmW48EV_XSZC8YE8IohbPg&s=10", "American Bullfrog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPXfuFaaYPo3otCvssqUdyMbr7jDn0zjC2yw&s=10", "Red-Eyed Tree Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5FXU6brmaop3V7mqCmP6Qu2_-GZYeNsca8A&s=10", "Purple Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhmHnM82Yb7SoqqIKBh2rJc5C339tll6sjpw&s=10", "Purple Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxYabN0yLLfRp_21KPa5QggMTyoNSo7eQfAA&s=10", "Surinam Toad"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxvaNkViIruzLU9hOpzPHLVjzgGZv6VjHhw&s=10", "Surinam Toad"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ_OP-fq-eCUVEO_gLdV2VHUcBDYFgjXOaLA&s=10", "Goliath Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXSgQCqx0TJncIendgGJ8179DXahHIf4m4ZQ&s=10", "Pixie Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGFGe-GsPeMsueeyCwLwHdZ-IIW39XyoodCQ&s=10", "Budgett's Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGDktyHmLCPXjX6TL1cP0E7XKettXr5tekvQ&s=10", "Budgett's Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy7f4bI474KOhzGTYbdxcNrPTcfh89ryMNqg&s=10", "Oriental Fire-Bellied Toad"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH1bi-Z_UeaNZvNNGhvH9DAllYWOI6kciepg&s=10", "Strawberry Poison-Dart Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS23kxLnS8bAddCZLjTSWaV4cvJnrpmk7x_og&s=10", "White-Lipped Tree Frog"],
				["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4UvB5qKWB967sXaPCV4xHklCKHRHdJdhHLQ&s=10", "Johnson's Horned Treefrog"]
			];
			for (const data of parsed.events) {
				if (data === "[DONE]") {
					var wasAtBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
					var randomNumber = Math.floor(Math.random() * forgleImages.length);
					var forgleImage = forgleImages[randomNumber];
					var elmt = document.createElement('img');
					elmt.setAttribute('style', 'margin: 10px;max-width: 300px;display: block;cursor: pointer;');
					elmt.setAttribute('src', forgleImage[0]);
					elmt.onclick = forgleAbout.bind(this, forgleImage[1]);
					elmt.setAttribute('title', 'Click to Learn About this Frog...');
					assistantTextEl.appendChild(elmt);
					elmt.onload = function() {
						var wasAtBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
						if(wasAtBottom || lockBottom) {
							chatMessages.scrollTop = chatMessages.scrollHeight;
						}
					};
					if(wasAtBottom || lockBottom) {
						chatMessages.scrollTop = chatMessages.scrollHeight;
					}
					sawDone = true;
					buffer = "";
					break;
				}
				try {
					const jsonData = JSON.parse(data);
					// Handle both Workers AI format (response) and OpenAI format (choices[0].delta.content)
					let content = "";
					if (
						typeof jsonData.response === "string" &&
						jsonData.response.length > 0
					) {
						content = jsonData.response;
					} else if (jsonData.choices?.[0]?.delta?.content) {
						content = jsonData.choices[0].delta.content;
					}
					if (content) {
						responseText += content;
						flushAssistantText();
					}
				} catch (e) {
					console.error("Error parsing SSE data as JSON:", e, data);
				}
			}
			if (sawDone) {
				break;
			}
		}

		// Add completed response to chat history
		if (responseText.length > 0) {
			chatHistory.push({ role: "assistant", content: responseText });
		}
	} catch (error) {
		console.error("Error:", error);
		addMessageToChat(
			"assistant",
			"Sorry, there was an error processing your request.",
		);
	} finally {
		// Hide typing indicator
		typingIndicator.classList.remove("visible");

		// Re-enable input
		isProcessing = false;
		userInput.disabled = false;
		sendButton.disabled = false;
		userInput.focus();
	}
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content) {
	var wasAtBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
	const messageEl = document.createElement("div");
	messageEl.className = `message ${role}-message`;
	messageEl.innerHTML = `<p>${content}</p>`;
	chatMessages.appendChild(messageEl);

	// Scroll to bottom
	if(wasAtBottom || lockBottom) {
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
}

function consumeSseEvents(buffer) {
	let normalized = buffer.replace(/\r/g, "");
	const events = [];
	let eventEndIndex;
	while ((eventEndIndex = normalized.indexOf("\n\n")) !== -1) {
		const rawEvent = normalized.slice(0, eventEndIndex);
		normalized = normalized.slice(eventEndIndex + 2);

		const lines = rawEvent.split("\n");
		const dataLines = [];
		for (const line of lines) {
			if (line.startsWith("data:")) {
				dataLines.push(line.slice("data:".length).trimStart());
			}
		}
		if (dataLines.length === 0) continue;
		events.push(dataLines.join("\n"));
	}
	return { events, buffer: normalized };
}
