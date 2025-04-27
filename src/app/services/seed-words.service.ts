import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SeedWordsService {

  constructor(private firestore: Firestore) {}

  async seedWords() {
    const wordsCollection = collection(this.firestore, 'palavras');

    const words = [
      {
        word: "Saudade",
        summary: "A unique Portuguese word describing the deep emotional feeling of missing someone or something dearly.",
        example: "Tenho saudades da minha família.",
        translation: "I miss my family."
      },
      {
        word: "Praia",
        summary: "Praia means beach. It’s where many people go to relax, swim, and enjoy the sun, especially in Brazil.",
        example: "Vamos à praia no fim de semana.",
        translation: "Let's go to the beach this weekend."
      },
      {
        word: "Festa",
        summary: "This word means party. Festas are a big part of Portuguese and Brazilian culture, full of music and dancing.",
        example: "A festa foi incrível ontem à noite.",
        translation: "The party was amazing last night."
      },
      {
        word: "Amor",
        summary: "Amor means love. It’s one of the most important and beautiful words in any language.",
        example: "O amor é a força mais poderosa do mundo.",
        translation: "Love is the most powerful force in the world."
      },
      {
        word: "Cidade",
        summary: "Cidade means city. Portugal and Brazil are full of vibrant cities rich with culture and history.",
        example: "Lisboa é uma cidade encantadora.",
        translation: "Lisbon is a charming city."
      },
      {
        word: "Família",
        summary: "Família means family, the group of people who share love, support, and strong bonds with one another.",
        example: "Minha família é tudo para mim.",
        translation: "My family means everything to me."
      },
      {
        word: "Viagem",
        summary: "Viagem means trip or travel. It’s often used to describe adventures to new places.",
        example: "Planejamos uma viagem para o Brasil.",
        translation: "We planned a trip to Brazil."
      },
      {
        word: "Amigo",
        summary: "Amigo means friend. Friends are an important part of life, offering companionship and joy.",
        example: "Ele é meu melhor amigo.",
        translation: "He is my best friend."
      },
      {
        word: "Trabalho",
        summary: "Trabalho means work or job. It’s a common word related to careers, effort, and achievements.",
        example: "Comecei um novo trabalho este mês.",
        translation: "I started a new job this month."
      },
      {
        word: "Sol",
        summary: "Sol means sun. It’s often associated with warmth, summer days, and energy.",
        example: "O sol está brilhando hoje.",
        translation: "The sun is shining today."
      },
      {
        word: "Café",
        summary: "Today’s word of the day means coffee, a very common word in Portuguese.Brazil is the world’s largest coffee producer.",
        example: "Vamos tomar um cafezinho hoje?",
        translation: "Let’s take a little coffee break today?"
      }
    ];

    for (const word of words) {
      await addDoc(wordsCollection, word);
    }
  }
}
