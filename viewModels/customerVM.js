let CustomerViewModel = {
    customersData: ko.observableArray([])
};

// convert binery data to url (image)
function convertBinary2url(binaryData) {
    // console.log(binaryData)
    const base64 = btoa(String.fromCharCode.apply(null, binaryData));
    const url = "data:image/jpeg;base64," + base64;
    // console.log(url);
    return url;
}

const mainURL = "http://localhost:8000/";

// refreash page function
const refreshPage = () => {
    $.getJSON(mainURL + 'countryCustomers/getCountries', data => {
        // console.log(data)
        data.customersData.forEach(country => {
            country.customers.forEach(customer => {
                if (customer.image != undefined) {
                    customer.image = "http://localhost:8000/uploads/" + customer.custNo + ".jpg";
                    // customer.image = convertBinary2url(customer.image.data);
                } else {
                    customer.image = "http://localhost:8000/uploads/default.png";
                }
            })
        });
        CustomerViewModel.customersData(data.customersData)
    })
}
// call for the first time
refreshPage();

// start add and update customers---------------------------

// set add customer modal
const setAddCustomer = () => {
    $('#customerModalLabel').empty().append('Add New Customer');
    $('#cOperationType').val('add');
    $('#customerId').val('');
    $('#customerCountry').val('');
    $('#title').val('');
    $('#custNo').val('');
    $('#custName').val('');
    $('#phone').val('');
    $('#email').val('');
    $('#gender').val('');
}

// set edit customer modal
const setEditCustomer = (id, custNo, custName, title, phone, email, gender, countryId) => {
    $('#customerModalLabel').empty().append('Edit Customer');
    $('#cOperationType').val('edit');
    $('#customerId').val(id);
    $('#customerCountry').val(countryId);
    $('#title').val(title);
    $('#custNo').val(custNo);
    $('#custName').val(custName);
    $('#phone').val(phone);
    $('#email').val(email);
    $('#gender').val(gender);
}

// send request
$('#customerForm').submit(event => {
    event.preventDefault();
    const type = $('#cOperationType').val();
    const countryId = $('#customerCountry').val();
    const customerId = $('#customerId').val();
    const title = $('#title').val();
    const custNo = $('#custNo').val();
    const custName = $('#custName').val();
    const phone = $('#phone').val();
    const email = $('#email').val();
    const gender = $('#gender').val();
    const jsonData = {
        title: title,
        custNo: custNo,
        custName: custName,
        phone: phone,
        email: email,
        gender: gender
    }

    console.log(customerId)

    let url = mainURL + 'countryCustomers/' + countryId;
    (type === 'add') ? url += '/addCustomer' : url += '/updateCustomer/' + customerId;

    $.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        data: jsonData,
        success: (res, textStatus, xhr) => {
            console.log(res);
            console.log(customerId)
            $('#custMsg').empty().append(res.msg);
            $('#customerModal').modal('toggle');
            // refreshPage();
            // add customer image
            let imageForm = new FormData();
            if ($('#image').prop('files').length > 0) {
                let file = $('#image').prop('files')[0];
                console.log('img', file)
                imageForm.append("image", file); // (image) as the name in backend
                console.log(countryId, '/', customerId)
                let imgUrl = mainURL + 'countryCustomers/' + countryId + '/addCustomerImg/' + custNo;
                console.log('id', customerId, imgUrl)
                // refreshPage()

                $.ajax({
                    url: imgUrl,
                    type: 'PUT',
                    data: imageForm,
                    processData: false,
                    contentType: false,
                    success: (res, textStatus, xhr) => {
                        $('#custMsg').empty().append('image added');
                        $('#customerModal').modal('toggle');
                        refreshPage();
                    },
                    error: (xhr, textStatus, error) => {
                        // console.log(error)
                        $('#custMsg').empty().append('image not saved');
                    }
                })
            }
        },
        error: (xhr, textStatus, error) => {
            $('#custMsg').empty().append('Error, please try again.');
        }
    })
})



// end of add and update customers----------------------------


// start add and update country---------------------------

// set add country modal function
const setAddCountry = () => {
    $('#countryModalLabel').empty().append('Add New Country');
    $('#operationType').val('add');
    $('#countryId').val('');
    $('#country').val('');
}


// set edit country modal function
const setEditCountry = (id, newCountry) => {
    $('#countryModalLabel').empty().append('Edit Country');
    $('#operationType').val('edit');
    $('#countryId').val(id);
    $('#country').val(newCountry);
}

// add & update country (send request)
$('#countryForm').submit(event => {
    event.preventDefault();
    const countryName = $('#country').val();
    const countryId = $('#countryId').val();
    const type = $('#operationType').val();
    let url = mainURL + "countryCustomers/";
    if (type === 'add') {
        url += 'createCountry';
    } else {
        url += 'updateCountry/' + countryId;
    }
    $.ajax({
        url: url,
        type: (type == 'add') ? 'POST' : 'PUT',
        dataType: 'json',
        data: { _id: countryId, country: countryName },
        success: (res, textStatus, xhr) => {
            console.log(res)
            $('#msg').empty().append('success');
            $('#countryModal').modal('toggle');
            refreshPage();
        },
        error: (xhr, textStatus, error) => {
            $('#msg').empty().append(error.message);
        }
    })
})
// end of add and update country----------------------------

// start Remove country and customers-----------------------

// set remove function
const setRemove = (type, id, parentId) => {
    $('#deleteType').val(type);
    $('#deleteId').val(id);
    $('#parentId').val(parentId);
}

// send remove(country || customer) request
$('#deleteEntry').submit(event => {
    event.preventDefault();
    const type = $('#deleteType').val();
    const customerId = $('#deleteId').val();
    const countryId = $('#parentId').val();
    let url = mainURL + 'countryCustomers/';
    if (type === 'country') {
        url += 'deleteCountry/' + id;
    } else {
        url += countryId + '/deleteCustomer/' + customerId;
    }

    $.ajax({
        url: url,
        type: "DELETE",
        dataType: 'json',
        success: (res, textStatus, xhr) => {
            $('#removeModal').modal('toggle');
            refreshPage();
        },
        error: (xhr, textStatus, error) => {
            $('#removeMsg').empty().append('Error' + error.message);
        }
    })
})

// end of remove country and customers-----------------------



ko.applyBindings(CustomerViewModel);