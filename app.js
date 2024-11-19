const express = require("express");
const app = express();
const port = 3000;
const { loadContact, findContact, addContact, cekDuplikat, deleteContact } = require('./utils/contacts.js');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

//! memanggil express layout
const expressLayouts = require('express-ejs-layouts');
//! untuk menggunakan express layoutnya (third-party middleware punya express)
app.use(expressLayouts);
//? memberitahukan express kalo kita viewnya menggunakan ejs
app.set("view engine", "ejs");
// Build in middleware
app.use(express.static('public'));
// Build in middleware untuk parse data yang user isi
app.use(express.urlencoded({ extended: true }));
// konfigurasi flashnya
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: 6000 },
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());




app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Efraim",
      email: "hayoappa@gmail.com",
    },
    {
      nama: "urel",
      email: "gataumales@gmail.com",
    },
    {
      nama: "Molly",
      email: "hayamaja@gmail.com",
    },
    {
      nama: "Ebong",
      email: "apaliatliat@gmail.com",
    },
  ];

  res.render("index", {
    layout : 'layouts/main-layout',
    nama: "efraim urel palodang",
    tittle: "Halaman Home",
    mahasiswa
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout : 'layouts/main-layout',
    tittle : 'Halaman About'
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  
  res.render("contact", {
    layout : 'layouts/main-layout',
    tittle : 'Halaman Contact',
    contacts,
    msg: req.flash('msg')
  });
});

// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    tittle: "Form Tambah Data Contact",
    layout: 'layouts/main-layout',
  });
});

// function validation
const emailVal = () => check('email', 'Email anda tidak valid silahkan cek kembali!!').isEmail();
const noVal = () => check('nohp', 'noHp tidak valid harap periksa lagi!!').isMobilePhone('id-ID');


// proses data contact
app.post('/contact', [ body('nama').custom((value) => {
  const duplikat = cekDuplikat(value);
  if(duplikat) {
    throw new Error('Nama Yang Anda Masukkan Sudah Terdaftar!!');
  }
  return true;
}),
  emailVal(), 
  noVal()
], (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render("add-contact", {
      tittle: "Form Tambah Data Contact",
      layout: 'layouts/main-layout',
      errors: errors.array(),
    });
  } else {
    addContact(req.body);
    // kirimkan flash message
    req.flash('msg', 'Data Kontak Berhasil Ditambahkan!');

    res.redirect('/contact');
  }

})

// proses delete contact
app.get('/contact/delete/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  // jika kontak tidak ada
  if(!contact) {
    res.status(404);
    res.send('<h1 style="font-size:20rem; text-align:center;">404</h1>');
  } else {
    deleteContact(req.params.nama);
    // kirimkan flash message
    req.flash('msg', 'Data Kontak Berhasil Dihapus!');

    res.redirect('/contact');
  }
});

// form ubah data contact
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("edit-contact", {
    tittle: "Form Ubah Data Contact",
    layout: 'layouts/main-layout',
    contact,
  });
});

// proses ubah data
app.post('/contact/update', (req, res) => {
  res.send(req.body);
});




// halaman detail contact
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  
  res.render("detail", {
    layout : 'layouts/main-layout',
    tittle : 'Halaman Detail Contact',
    contact
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});
