// 联系表单API接口
export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  message: string;
}

// 发送联系表单邮件
export async function sendContactEmail(formData: ContactFormData) {
  try {
    // 这里使用EmailJS或其他邮件服务
    // 为了演示，我们先使用一个模拟的API调用
    
    // 构建邮件内容
    const emailContent = {
      to: 'your-email@example.com', // 替换为您的邮箱
      subject: `新的联系咨询 - ${formData.name}`,
      html: `
        <h2>新的联系咨询</h2>
        <p><strong>姓名:</strong> ${formData.name}</p>
        <p><strong>邮箱:</strong> ${formData.email}</p>
        <p><strong>公司:</strong> ${formData.company || '未填写'}</p>
        <p><strong>职位:</strong> ${formData.position || '未填写'}</p>
        <p><strong>联系方式:</strong> ${formData.phone || '未填写'}</p>
        <p><strong>需求描述:</strong></p>
        <p>${formData.message}</p>
        <hr>
        <p><small>发送时间: ${new Date().toLocaleString('zh-CN')}</small></p>
      `
    };

    // 这里可以集成EmailJS、SendGrid、或其他邮件服务
    // 示例使用fetch发送到后端API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      throw new Error('邮件发送失败');
    }

    return { success: true };
  } catch (error) {
    console.error('发送邮件时出错:', error);
    throw error;
  }
}

// 使用EmailJS的替代方案（需要安装emailjs-com包）
export async function sendContactEmailWithEmailJS(formData: ContactFormData) {
  try {
    // 需要先安装: npm install emailjs-com
    // 然后在EmailJS网站注册并获取服务ID、模板ID和用户ID
    
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      company: formData.company,
      position: formData.position,
      phone: formData.phone,
      message: formData.message,
      to_email: 'your-email@example.com' // 替换为您的邮箱
    };

    // 这里需要替换为您的EmailJS配置
    // const result = await emailjs.send(
    //   'YOUR_SERVICE_ID',
    //   'YOUR_TEMPLATE_ID',
    //   templateParams,
    //   'YOUR_USER_ID'
    // );

    // 临时返回成功，实际使用时需要配置EmailJS
    return { success: true };
  } catch (error) {
    console.error('EmailJS发送失败:', error);
    throw error;
  }
}