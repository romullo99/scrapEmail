require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

async function scrapeData() {
    try {
        const { data: html } = await axios.get(process.env.SCRAPING_URL);

        const $ = cheerio.load(html);

        const headlines = [];

        $('.feed-post-body').each((i, element) => {
            const title = $(element).find('.feed-post-link').text().trim();
            const description = $(element).find('.feed-post-body-resumo').text().trim();
            headlines.push({ title, description });
        });

        return headlines;
    } catch (error) {
        console.error('Erro ao realizar o scraping:', error);
        throw error;
    }
}

async function sendEmail(content) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const emailContent = content.map((headline, index) => 
        `Notícia ${index + 1}:\nTítulo: ${headline.title}\nDescrição: ${headline.description || 'Sem descrição disponível'}\n\n`
    ).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Principais Manchetes do GE Pernambuco',
        text: `Aqui estão as principais manchetes:\n\n${emailContent}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso!');
}

async function main() {
    try {
        const scrapedData = await scrapeData();
        await sendEmail(scrapedData);
    } catch (error) {
        console.error('Erro no processo:', error);
    }
}

main();
