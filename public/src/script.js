const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = form.querySelector('button[type="submit"]');

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');

  if (!chatBox) return;
  let scrollTimeout;
  const showScrollbar = () => {
    chatBox.classList.add('scrolling');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      chatBox.classList.remove('scrolling');
    }, 1200);
  };

  chatBox.addEventListener('wheel', showScrollbar, { passive: true });
  chatBox.addEventListener('touchmove', showScrollbar, { passive: true });
});

window.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById("user-input");
  if (!textarea) return;

  textarea.addEventListener("input", () => {
    textarea.style.height = "56px";
    const maxHeight = 160;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";

    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById("user-input");
  if (!textarea) return;
  let scrollTimeout;

  const showTextareaScrollbar = () => {
    textarea.classList.add("scrolling");
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
      textarea.classList.remove("scrolling");
    }, 1400);
  };

  textarea.addEventListener("scroll", showTextareaScrollbar);
  textarea.addEventListener("touchmove", showTextareaScrollbar, { passive: true });
});

appendMessage(
  'bot',
  'Selamat datang di <strong>PT. MEJIKU DIGITAL – IT Helpdesk Assistant (Chatbot)</strong><br><br>Silakan sampaikan kendala, insiden, atau permintaan layanan Anda.<br>Tim kami akan membantu Anda secepatnya.'
);

let conversation = [];
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();

  if (!userMessage) return;
  appendMessage('user', userMessage);

  conversation.push({
    role: 'user',
    text: userMessage,
  });

  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;
  submitBtn.disabled = true;

  const loadingMessage = appendMessage(
    'bot',
    'Sedang memproses...'
  );

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Gagal mendapatkan respon');
    }

    loadingMessage.textContent = data.result;

    conversation.push({
      role: 'bot',
      text: data.result,
    });
  } catch (error) {
    loadingMessage.textContent = error.message || 'Terjadi kesalahan.';
  } finally {
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
  }
});


function appendMessage(sender, text) {
  const msg = document.createElement('div');

  msg.classList.add('message');
  msg.classList.add(sender);

  let formattedText = text.replace(/\*\*/g, '').replace(/\n/g, '<br>');
  msg.innerHTML = formattedText;

  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;
}