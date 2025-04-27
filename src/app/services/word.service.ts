import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  constructor(private firestore: Firestore) {}

  // Fetch all words as a list
  getWords(): Observable<any[]> {
    const wordsCollection = collection(this.firestore, 'palavras');
    return collectionData(wordsCollection, { idField: 'id' }) as Observable<any[]>;
  }
}
