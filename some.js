// Constants declaration
const invalidEmailElement = document.querySelector('#invalidEmail')
const selectElement = document.querySelector("#category")
const emailInput = document.getElementById('email')
const firstNameInput = document.getElementById('first_name')
const lastNameInput = document.getElementById('last_name')
const jobTitleInput = document.getElementById('job_title')

const TIME_ZONE = 'Asia/Kolkata'
const N8NURL = ""
const BASE_URL = "https://us-west-1c.zuperpro.com/api"
const jobDuration = 180

let latitude
let longitude
let categories = []
let estimatedDurationInput
let customerUid
let jobTitle
let categoryName

// Define a debounce function
function debounce(func, delay) {
  let timeoutId
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(context, args)
    }, delay)
  }
}

// Fetch customer data from API
function fetchCustomerData(email) {
  invalidEmailElement.classList.remove('flex')
  invalidEmailElement.classList.add('d-none')

  if (email !== '') {
    const url = 'https://app.zuperpro.com/api/customers?filter.keyword=' + email
    axios.get(url, { headers: { 'x-api-key': '4dc53123feec9d4631d7f2cd0c854f39' } })
      .then(function (response) {
        if (response.data.data[0].customer_uid) {
          console.log(response.data.data[0], '////////')
          let data = response.data.data[0]
          customerUid = data.customer_uid
          console.log(data, 45)

          // Populate input fields with customer data
          firstNameInput.value = data.customer_first_name || ''
          lastNameInput.value = data.customer_last_name || ''
          document.getElementById('phone_no').value = data.customer_contact_no?.mobile.trim() || data.customer_contact_no?.home.trim() || ''
          document.getElementById('street_address').value = data.customer_address?.street.trim() || ''
          document.getElementById('city').value = data.customer_address?.city.trim() || ''
          document.getElementById('state_province').value = data.customer_address?.state.trim() || ''
          document.getElementById('country').value = data.customer_address?.country.trim() || ''
          document.getElementById('zipcode').value = data.customer_address?.zip_code?.trim() || ''
          assignCategory()
        } else {
          // Show invalid email message
          invalidEmailElement.classList.add('d-flex')

          // Clear input fields
          firstNameInput.value = ''
          lastNameInput.value = ''
          document.getElementById('street_address').value = ''
          document.getElementById('city').value = ''
          document.getElementById('state_province').value = ''
          document.getElementById('country').value = ''
          document.getElementById('zipcode').value = ''
          document.getElementById('phone_no').value = ''
        }
      })
      .catch(function (error) {
        console.error(error)
      })
  }
}

// Fetch categories from API
function getCategories() {
  const url = 'https://app.zuperpro.com/api/jobs/category'
  axios.get(url, { headers: { 'x-api-key': '4dc53123feec9d4631d7f2cd0c854f39' } })
    .then((resp) => {
      categories = resp.data.data || []
      console.log(categories, '///////')
      if (categories.length > 0) {
        assignCategory(categories[0].category_uid)
        categoryName = categories[0].category_name
        // Clear existing options

        // Populate select options with categories
        categories.forEach((option, index) => {
          const optionElement = document.createElement("option")
          optionElement.value = option.category_uid
          optionElement.textContent = option.category_name
          selectElement.appendChild(optionElement)
          if (index === 0) {
            optionElement.selected = true
          }
        })
      }
    })
}

function assignCategory(categoryUid) {
  let { category_name } = getCategoryName(categoryUid)
  let { estimated_duration } = getCategoryName(categoryUid)
  let firstName = firstNameInput.value.trim()
  let lastName = lastNameInput.value.trim()
  estimatedDurationInput = estimated_duration
}

function assignCategory() {
  let firstName = firstNameInput.value.trim()
  let lastName = lastNameInput.value.trim()
  jobTitle = `${categoryName || 'Job'} for ${firstName} ${lastName}`
}


// Apply debouncing to the email input event listener
emailInput.addEventListener('input', debounce(function () {
  let email = emailInput.value.trim()
  fetchCustomerData(email)
}, 1500))

// Event listener for category select change
selectElement.addEventListener('change', function () {
  let categoryUid = selectElement.value
  let { category_name } = getCategoryName(categoryUid)
  let { estimated_duration } = getCategoryName(categoryUid)
  let firstName = firstNameInput.value.trim()
  let lastName = lastNameInput.value.trim()
  estimatedDurationInput = estimated_duration
  jobTitle = `${category_name} for ${firstName} ${lastName}`
})

// Get category name by category UID
function getCategoryName(categoryUid) {
  for (let i = 0;i < categories.length;i++) {
    if (categories[i].category_uid === categoryUid) {
      return { category_name: categories[i].category_name, estimated_duration: categories[i].estimated_duration }
    }
  }
  return ''
}

// Initialize Google Map
function initMap() {
  const map = new google.maps.Map(document.getElementById('map-container'), {
    center: { lat: 37.7749, lng: -122.4194 }, // Default center coordinates
    zoom: 12, // Default zoom level
  })

  const input = document.getElementById('street_address')
  const autocomplete = new google.maps.places.Autocomplete(input)
  autocomplete.bindTo('bounds', map)

  autocomplete.addListener('place_changed', function () {
    const place = autocomplete.getPlace()
    if (!place.geometry) {
      return
    }

    // Center the map on the selected place
    map.setCenter(place.geometry.location)
    map.setZoom(15) // Adjust zoom level as needed

    // Retrieve and use coordinates (latitude and longitude) of the selected place
    latitude = place.geometry.location.lat()
    longitude = place.geometry.location.lng()

    // Update input values based on address types
    place.address_components.forEach(address => {
      switch (address.types[0]) {
        case "locality":
          document.getElementById('city').value = address.long_name
          break

        case "administrative_area_level_1":
          document.getElementById('state_province').value = address.long_name
          break

        case "country":
          document.getElementById('country').value = address.long_name
          break

        case "postal_code":
          document.getElementById('zipcode').value = address.long_name
          break
      }
    })
  })
}

// Load Google Map on window load
google.maps.event.addDomListener(window, 'load', initMap)

// Fetch categories and initialize Google Map on page load
getCategories()

// Create job function
function createJob() {
  finalError.classList.remove('flex')
  finalError.classList.add('hidden')
  // Code for creating a job
  let description = $("#description").val()
  let due_date = $("#due_date").val()
  let scheduled_start_time = $("#due_time").val()
  let first_name = $("#first_name").val()
  let last_name = $("#last_name").val() || ""
  let email = $("#email").val()
  let phone_no = $("#phone_no").val()
  let category = $("#category").val()
  let street_address = $("#street_address").val()
  let city = $("#city").val()
  let state_province = $("#state_province").val() || ""
  let country = $("#country").val() || ""
  let zipcode = $("#zipcode").val()

  const formattedDate = moment(due_date).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
  const formattedDateEnd = moment(due_date).add(estimatedDurationInput).format("YYYY-MM-DDTHH:mm:ss.SSSZ")

  let formData = {
    job_title: jobTitle,
    description,
    first_name,
    last_name,
    email,
    phone_no,
    category,
    street_address,
    formattedDate,
    formattedDateEnd,
    city,
    state_province,
    country,
    zipcode,
    customerUid,
    scheduled_start_time,
    coordinates: [latitude, longitude],
  }
  console.log(formData)

  if (!description) {
  finalError.classList.remove('hidden')
  finalError.classList.add('flex')
  return
  }
  const url = 'https://internalwf.zuper.co/webhook/3e4b4f7c-8b2b-453e-a54c-312af2d3b78b'

  axios.post(url, JSON.stringify(formData), {
    headers: {
      "Content-Type": "application/json"
    }
  })
  $('#toast-save').toast('show')
  $("#job-form").addClass('hidden');
  $("#action-div").addClass('hidden');
}

// Set current time in due time field
let currentTimeString = moment().format('HH:mm')
document.getElementById("due_time").value = currentTimeString

// Set minimum date for due date field
let today = moment().format('YYYY-MM-DD')
document.getElementById("due_date").setAttribute("min", today)