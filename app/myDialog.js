function showDialog(id)
{
    return $('.myDialogBack').fadeIn(250, () => {$(id).fadeIn(250)})
}

function hideDialog(id)
{
    return $(id).fadeOut(250, () => {$('.myDialogBack').fadeOut(250)})
}