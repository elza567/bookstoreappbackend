const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

const books = [
  { id: "SF-001", title: "Dune", author: "Frank Herbert", publishedYear: 1965, genre: "Science Fiction", ISBN: "9780441013593", imageUrl: "https://covers.openlibrary.org/b/id/15092781-M.jpg", price: 499, rentalPrice: 100, description: "Epic science fiction novel set on the desert planet Arrakis, featuring politics, religion, and power struggles." },
  { id: "SF-002", title: "The Martian", author: "Andy Weir", publishedYear: 2011, genre: "Science Fiction", ISBN: "9780553418026", imageUrl: "https://covers.openlibrary.org/b/id/14641755-M.jpg", price: 399, rentalPrice: 80, description: "Astronaut stranded on Mars must survive using ingenuity and science." },
  { id: "SF-003", title: "Frankenstein", author: "Mary Shelley", publishedYear: 1818, genre: "Science Fiction", ISBN: "9780486282114", imageUrl: "https://covers.openlibrary.org/b/id/12752093-M.jpg", price: 299, rentalPrice: 70, description: "Classic tale of science, ambition, and the consequences of playing god." },
  { id: "SF-004", title: "Red Rising", author: "Pierce Brown", publishedYear: 2014, genre: "Science Fiction", ISBN: "9780345539786", imageUrl: "https://covers.openlibrary.org/b/id/15134076-M.jpg", price: 449, rentalPrice: 90, description: "Dystopian saga of revolution, class struggle, and interplanetary adventure." },
  { id: "SF-005", title: "Project Hail Mary", author: "Andy Weir", publishedYear: 2021, genre: "Science Fiction", ISBN: "9780593135204", imageUrl: "https://covers.openlibrary.org/b/id/14837125-M.jpg", price: 499, rentalPrice: 110, description: "A lone astronaut must save Earth from disaster in this thrilling science adventure." },

  { id: "TH-001", title: "Conclave", author: "Robert Harris", publishedYear: 2016, genre: "Thriller", ISBN: "9780099593780", imageUrl: "https://covers.openlibrary.org/b/id/14919517-M.jpg", price: 399, rentalPrice: 80, description: "Political thriller set in the Vatican during a papal election." },
  { id: "TH-002", title: "Gone Girl", author: "Gillian Flynn", publishedYear: 2012, genre: "Thriller", ISBN: "9780307588371", imageUrl: "https://covers.openlibrary.org/b/id/12498395-M.jpg", price: 449, rentalPrice: 90, description: "A psychological thriller about a marriage gone terribly wrong." },
  { id: "TH-003", title: "The Silent Wife", author: "A. S. A. Harrison", publishedYear: 2013, genre: "Thriller", ISBN: "9780143124298", imageUrl: "https://covers.openlibrary.org/b/id/14833534-M.jpg", price: 399, rentalPrice: 85, description: "A tense psychological thriller about deception, betrayal, and revenge." },
  { id: "TH-004", title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", publishedYear: 2005, genre: "Thriller", ISBN: "9780307454546", imageUrl: "https://covers.openlibrary.org/b/id/15145260-M.jpg", price: 499, rentalPrice: 100, description: "A gripping mystery featuring investigative journalist and hacker duo." },
  { id: "TH-005", title: "The Woman in the Window", author: "A. J. Finn", publishedYear: 2018, genre: "Thriller", ISBN: "9780062678412", imageUrl: "https://covers.openlibrary.org/b/id/12379672-M.jpg", price: 399, rentalPrice: 80, description: "Psychological thriller about an agoraphobic woman witnessing a crime." },

  { id: "HO-001", title: "The King in Yellow", author: "Robert W. Chambers", publishedYear: 1895, genre: "Horror", ISBN: "9780486439433", imageUrl: "https://covers.openlibrary.org/b/id/14996498-M.jpg", price: 299, rentalPrice: 70, description: "Classic horror stories with cosmic and psychological terror." },
  { id: "HO-002", title: "The Haunting of Hill House", author: "Shirley Jackson", publishedYear: 1959, genre: "Horror", ISBN: "9780143039981", imageUrl: "https://covers.openlibrary.org/b/id/12684825-M.jpg", price: 349, rentalPrice: 75, description: "A chilling novel about a haunted house and its effects on its inhabitants." },
  { id: "HO-003", title: "Ghost of Silent Hill", author: "Masahiro Ito", publishedYear: 2010, genre: "Horror", ISBN: "9781595823872", imageUrl: "https://covers.openlibrary.org/b/id/15112734-M.jpg", price: 399, rentalPrice: 80, description: "Horror novel inspired by the famous video game series." },
  { id: "HO-004", title: "The Shining", author: "Stephen King", publishedYear: 1977, genre: "Horror", ISBN: "9780307743657", imageUrl: "https://covers.openlibrary.org/b/id/15090478-M.jpg", price: 449, rentalPrice: 90, description: "Classic horror story set in an isolated, haunted hotel." },
  { id: "HO-005", title: "Bird Box", author: "Josh Malerman", publishedYear: 2014, genre: "Horror", ISBN: "9780062259666", imageUrl: "https://covers.openlibrary.org/b/id/11377399-M.jpg", price: 399, rentalPrice: 85, description: "Survival horror story about unseen creatures that drive people to madness." },

  { id: "RO-001", title: "The Twisted Throne", author: "Danielle L. Jensen", publishedYear: 2019, genre: "Romance", ISBN: "9781949694026", imageUrl: "https://images-na.ssl-images-amazon.com/images/P/0593975308.01._SX50_SCLZZZZZZZ_.jpg", price: 399, rentalPrice: 80, description: "Romantic fantasy adventure full of intrigue and passion." },
  { id: "RO-002", title: "First-Time Caller", author: "B. K. Borison", publishedYear: 2023, genre: "Romance", ISBN: "9780593547885", imageUrl: "https://covers.openlibrary.org/b/id/14840886-M.jpg", price: 449, rentalPrice: 90, description: "A contemporary romance about love, first meetings, and connections." },
  { id: "RO-003", title: "When I Think of You", author: "Myah Ariel", publishedYear: 2023, genre: "Romance", ISBN: "9780593499245", imageUrl: "https://covers.openlibrary.org/b/id/14611544-M.jpg", price: 399, rentalPrice: 80, description: "Heartwarming modern romance exploring love and self-discovery." },
  { id: "RO-004", title: "A Little Fate", author: "Nora Roberts", publishedYear: 2020, genre: "Romance", ISBN: "9781250271901", imageUrl: "https://covers.openlibrary.org/b/id/11563847-M.jpg", price: 449, rentalPrice: 90, description: "Romance story of destiny, choices, and love overcoming obstacles." },
  { id: "RO-005", title: "Romeo and Juliet", author: "William Shakespeare", publishedYear: 1597, genre: "Romance", ISBN: "9780743477116", imageUrl: "https://covers.openlibrary.org/b/id/14793893-M.jpg", price: 299, rentalPrice: 70, description: "Classic Shakespearean tragedy of love and conflict." }
];

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for books seeding');

    await Book.deleteMany();
    console.log('Old books cleared');

    for (const book of books) {
      const createdBook = await Book.create(book);
      console.log(`Inserted: ${createdBook.title} (${createdBook.id})`);
    }

    console.log('All books seeded successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding books:', err);
    mongoose.disconnect();
  }
};

seedBooks();
