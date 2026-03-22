// FAQ Accordion Module
export function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  if (!faqItems.length) {
    console.warn('No FAQ items found');
    return;
  }

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!question || !answer || !icon) {
      console.warn('FAQ item missing required elements');
      return;
    }

    question.addEventListener('click', () => {
      const isActive = answer.classList.contains('active');

      // Close all other answers
      faqItems.forEach(i => {
        const otherAnswer = i.querySelector('.faq-answer');
        const otherIcon = i.querySelector('.faq-icon');

        if (otherAnswer && otherIcon) {
          otherAnswer.classList.remove('active');
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.paddingBottom = '0';
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current answer
      if (!isActive) {
        answer.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingBottom = '1.25rem'; // pb-5 (20px)
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  console.log('FAQ accordion initialized');
}
